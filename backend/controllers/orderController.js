const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
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

const updateAnalytics = async ({ order, isNewOrder = false }) => {
    try {
        // Get existing analytics or create new
        let analytics = await Analytics.findOne();
        if (!analytics) analytics = new Analytics();

        // --- Update total sales & revenue for new completed orders ---
        if (isNewOrder) {
            analytics.totalSales += 1;
            analytics.totalRevenue += order.totalAmount;
        }

        // --- Update top products ---
        order.products.forEach(p => {
            const existingProduct = analytics.topProducts.find(tp =>
                tp.productId.equals(p.product)
            );
            if (existingProduct) {
                existingProduct.totalQuantity += p.quantity;
            } else {
                analytics.topProducts.push({
                    productId: p.product,
                    totalQuantity: p.quantity
                });
            }
        });

        // --- Update active users today ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadyActive = analytics.activeUsersToday.find(au =>
            au.userId.equals(order.user) && new Date(au.date).toDateString() === today.toDateString()
        );

        if (!alreadyActive) {
            analytics.activeUsersToday.push({
                userId: order.user,
                date: today // store start of day
            });
        }

        // --- Update repeated users ---
        const completedOrdersCount = await Order.countDocuments({
            user: order.user,
            status: 'completed'
        });

        const repeatedUser = analytics.repeatedUsers.find(ru =>
            ru.userId.equals(order.user)
        );

        if (completedOrdersCount > 1) {
            if (repeatedUser) {
                repeatedUser.ordersCount = completedOrdersCount;
            } else {
                analytics.repeatedUsers.push({
                    userId: order.user,
                    ordersCount: completedOrdersCount
                });
            }
        } else if (repeatedUser) {
            // Remove if no longer repeated
            analytics.repeatedUsers = analytics.repeatedUsers.filter(
                ru => !ru.userId.equals(order.user)
            );
        }

        analytics.updatedAt = new Date();
        await analytics.save();
    } catch (err) {
        console.error('updateAnalytics error:', err);
    }
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

        // ===== Emit Socket.io event =====
        const io = req.app.locals.io;
        io.emit('newOrder', {
            orderId: order._id,
            user: req.user.userId,
            totalAmount: finalAmount,
            deliveryCharge,
            totalWeight,
            createdAt: order.createdAt
        });

        // ===== Update analytics =====
        await updateAnalytics({ order, isNewOrder: true });

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

        // ===== Emit Socket.io event for status update =====
        const io = req.app.locals.io;
        io.emit('orderStatusUpdated', {
            orderId: order._id,
            status: order.status,
            userId: order.user._id,
            updatedAt: new Date()
        });

        // ===== Update analytics if order completed =====
        if (status === 'completed') {
            await updateAnalytics({ order });
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
            // Find user IDs that match name or email
            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: customer, $options: 'i' } },
                    { email: { $regex: customer, $options: 'i' } },
                ],
            }).select('_id');

            const userIds = matchingUsers.map(u => u._id);
            query.user = { $in: userIds };
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
            .populate('products.product', 'name')
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