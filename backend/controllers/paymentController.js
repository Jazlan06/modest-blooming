const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const { calculateDeliveryCharge } = require("../helpers/calculateDeliveryCharge");
const sendEmail = require("../utils/sendEmail");
const { updateAnalytics } = require("./orderController");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ Razorpay keys missing. Payment won't work.");
}

//    💰 STEP 1: CREATE TEMPORARY RAZORPAY ORDER

exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount || amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });

        // Razorpay options
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            payment_capture: 1,
        };

        const rzpOrder = await razorpay.orders.create(options);

        res.status(200).json({
            rzpOrderId: rzpOrder.id,
            amount,
            currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("❌ createRazorpayOrder error:", err);
        res.status(500).json({ message: "Server error creating Razorpay order" });
    }
};

// ✅ STEP 2: VERIFY PAYMENT + CREATE ORDER IN DB
exports.verifyAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            checkoutData,
        } = req.body;

        // 1️⃣ Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature)
            return res.status(400).json({ message: "Invalid payment signature" });

        // 2️⃣ Validate checkout data
        if (!checkoutData || !checkoutData.products || checkoutData.products.length === 0)
            return res.status(400).json({ message: "Missing or invalid checkout data" });

        const {
            products,
            totalAmount,
            couponApplied,
            address,
            isHamper,
            hamperNote,
            paymentMethod = "razorpay",
        } = checkoutData;

        // 3️⃣ Recalculate delivery charge for safety
        const { deliveryCharge } = await calculateDeliveryCharge({
            cartItems: products,
            address,
            isHamper,
        });

        const finalAmount = totalAmount + deliveryCharge;

        // 4️⃣ Prepare order items
        const orderProducts = products.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            priceAtPurchase: item.priceAtPurchase,
        }));

        // 5️⃣ Coupon check
        let couponId = null;
        if (couponApplied) {
            if (/^[0-9a-fA-F]{24}$/.test(couponApplied)) {
                couponId = couponApplied;
            } else {
                const foundCoupon = await Coupon.findOne({ code: couponApplied.toUpperCase() });
                if (foundCoupon) couponId = foundCoupon._id;
            }
        }

        // 6️⃣ Create final order in DB
        const order = await Order.create({
            user: req.user.userId,
            products: orderProducts,
            totalAmount: finalAmount,
            deliveryCharge,
            address,
            isHamper,
            hamperNote,
            couponApplied: couponId,
            paymentInfo: {
                method: paymentMethod,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
            },
            status: "completed",
        });

        // 7️⃣ Update analytics
        await updateAnalytics({ order, incrementSales: true });

        // 8️⃣ Send confirmation email to user
        const user = await User.findById(req.user.userId);
        await sendEmail(
            user.email,
            "Payment Successful ✅",
            `Hi ${user.name},\n\nYour payment of ₹${order.totalAmount} was successful!\nOrder ID: ${order._id}\nWe'll notify you once it's shipped.\n\nThank you for shopping with us ❤️`
        );

        // 🔔 9️⃣ Notify store owner about the new order
        const ownerEmail = process.env.EMAIL_USER; // fallback
        const productLines = orderProducts.map(
            (item, idx) =>
                `${idx + 1}. ${item.product} - Qty: ${item.quantity} - ₹${item.priceAtPurchase}`
        );

        const addressBlock = `
${address.name}
${address.street}
${address.city}, ${address.state} - ${address.postalCode}
Phone: ${address.phone}
`;

        const ownerMessage = `
📦 New Order Received!

Order ID: ${order._id}
Customer: ${user.name} - ${user.phone} (${user.email}) 
Total Amount: ₹${order.totalAmount}
Delivery Charge: ₹${deliveryCharge}

🛒 Products:
${productLines.join("\n")}

🏠 Shipping Address:
${addressBlock}

${isHamper ? `🎁 Hamper Note: ${hamperNote || "N/A"}` : ""}

Please pack and ship this order promptly.
        `;

        await sendEmail(ownerEmail, "🛍️ New Order Placed!", ownerMessage);

        // ✅ Respond success
        res.status(201).json({
            message: "✅ Payment verified & order created successfully",
            order,
        });
    } catch (err) {
        console.error("❌ verifyAndCreateOrder error:", err);
        res.status(500).json({ message: "Server error verifying payment" });
    }
};

