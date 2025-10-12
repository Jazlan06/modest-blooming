const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateDeliveryCharge } = require('../helpers/calculateDeliveryCharge');

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

        const { deliveryCharge, ratePerKg, totalWeight } = calculateDeliveryCharge({
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
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order status updated', order });
    } catch (err) {
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
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product', 'title')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};