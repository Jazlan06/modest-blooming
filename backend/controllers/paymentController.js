const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { updateAnalytics } = require('./orderController');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay keys not set. Payment will not work.');
}

// Helper to calculate extra fees for non-UPI payments
const calculatePaymentFees = (amount, method) => {
    if (method === 'UPI') return 0;
    const feePercent = 0.02;
    const gst = 0.18;
    const fee = amount * feePercent;
    return Math.ceil(fee + fee * gst);
};

// Step 1: Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;
        // Reject unsupported payment methods
        if (paymentMethod !== 'razorpay') {
            return res.status(400).json({ message: 'Unsupported payment method' });
        }

        // Fetch your order
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Calculate final amount including any payment fees
        const fees = calculatePaymentFees(order.totalAmount, paymentMethod);
        const finalAmount = Math.round(order.totalAmount + fees);

        // Create Razorpay order
        const options = {
            amount: finalAmount * 100, // amount in paise
            currency: "INR",
            receipt: `order_${order._id}`,
            payment_capture: 1
        };

        const rzpOrder = await razorpay.orders.create(options);

        // Update order with preliminary payment info
        order.paymentInfo = {
            orderId: rzpOrder.id,
            method: paymentMethod,
            fees
        };
        await order.save();

        res.json({
            rzpOrderId: rzpOrder.id,
            amount: finalAmount,
            currency: options.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error('createRazorpayOrder error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Step 2: Verify payment signature (webhook/callback)
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Fetch order by Razorpay order_id
        const order = await Order.findOne({ 'paymentInfo.orderId': razorpay_order_id }).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Verify signature
        const crypto = require('crypto');
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Payment successful
        order.paymentInfo.paymentId = razorpay_payment_id;
        order.status = 'completed';
        await order.save();

        // Update analytics
        await updateAnalytics({ order, incrementSales: true });

        // Send confirmation email
        await sendEmail(order.user.email, 'Payment Successful ✅', `
            Hi ${order.user.name},
            Your payment of ₹${order.totalAmount} was successful.
            Order ID: ${order._id}
            Payment Method: ${order.paymentInfo.method}
        `);

        res.json({ message: 'Payment verified and order completed', order });

    } catch (err) {
        console.error('verifyPayment error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};