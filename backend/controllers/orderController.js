const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { calculateDeliveryCharge } = require('../helpers/calculateDeliveryCharge');

const formatReadableDate = (date) => {
  const options = {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

exports.placeOrder = async (req, res) => {
    try {
        const { products, totalAmount, couponApplied, address, isHamper } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products provided' });
        }

        const populatedCart = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item.product);
            return {
                product,
                quantity: item.quantity,
                selectedVariant: item.selectedVariant
            };
        }));
        // Format cart for deliveryCharge util
        const formattedCart = populatedCart.map(item => ({
            product: item.product,
            selectedVariant: item.selectedVariant,
            quantity: item.quantity
        }));

        const { deliveryCharge, ratePerKg, totalWeight } = await calculateDeliveryCharge({
            cartItems: formattedCart,
            address,
            isHamper
        });

        const finalAmount = totalAmount + deliveryCharge;

        // Save only necessary product fields in order
        const orderProducts = products.map(item => ({
            product: item.product,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            priceAtPurchase: item.priceAtPurchase
        }));

        const order = await Order.create({
            user: req.user.userId,
            products: orderProducts,
            totalAmount: finalAmount,
            deliveryCharge,
            address,
            isHamper,
            couponApplied
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order,
            deliveryCharge,
            totalWeight,
            ratePerKg
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('products.product', 'name');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const user = order.user;
    const formattedTime = formatReadableDate(new Date());

    const productSummary = order.products.map(p => {
      return `- ${p.product?.name || 'Product'} x ${p.quantity} (${p.selectedVariant || 'Default'})`;
    }).join('\n');

    // Email content to customer
    let subject = '';
    let body = '';

    if (status === 'shipped') {
      subject = 'Your order has been shipped 📦';
      body = `
Hi ${user.name},

Good news! Your order has been shipped on ${formattedTime}.

🛍️ Order Summary:
${productSummary}

We’ll update you once it has been delivered.

Thanks for shopping with Modest Blooming 🌸
      `;
    }

    if (status === 'completed') {
      subject = 'Your order has been delivered ✅';
      body = `
Hi ${user.name},

Your order has been marked as delivered on ${formattedTime}.

🛍️ Order Summary:
${productSummary}

We hope you love your purchase! 💐

Feel free to leave feedback or reach out if anything's not right.

With gratitude,  
Modest Blooming 🌸
      `;
    }

    if (status === 'cancelled') {
      subject = 'Your order has been cancelled ❌';
      body = `
Hi ${user.name},

We regret to inform you that your order was cancelled as of ${formattedTime}.

Possible reason: Delivery issues in your location or other constraints.

🛍️ Order Summary:
${productSummary}

We're sorry for the inconvenience and hope to serve you better next time.

- Team Modest Blooming 🌸
      `;
    }

    // Send email to customer if applicable
    if (['shipped', 'completed', 'cancelled'].includes(status)) {
      await sendEmail(user.email, subject, body.trim());
    }

    res.json({ message: 'Order status updated', order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('products.product', 'title price')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 15, status, customer, dateFrom, dateTo } = req.query;

        const query = {};

        // Filter by status
        if (status) query.status = status;

        // Filter by customer name/email
        if (customer) {
            query.$or = [
                { 'user.name': { $regex: customer, $options: 'i' } },
                { 'user.email': { $regex: customer, $options: 'i' } },
            ];
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Count total documents matching the filters
        const totalOrders = await Order.countDocuments(query);

        // Fetch paginated orders
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('products.product', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            orders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: parseInt(page),
            totalOrders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};