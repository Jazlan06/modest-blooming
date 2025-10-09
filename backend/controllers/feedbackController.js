const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const cloudinary = require('../utils/cloudinary');
const sendEmail = require('../utils/sendEmail');

exports.createFeedback = async (req, res) => {
    try {
        const { productId, orderId, message, rating } = req.body;

        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized or invalid order' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'Feedback allowed only after order is completed' });
        }

        const uploadedMedia = [];

        if (req.files && req.files.media) {
            for (let file of req.files.media) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto'
                });
                uploadedMedia.push(result.secure_url);
            }
        }

        const feedback = await Feedback.create({
            user: req.user.userId,
            product: productId,
            order: orderId,
            message,
            rating,
            media: uploadedMedia
        });

        if (rating <= 2) {
            const populatedFeedback = await Feedback.findById(feedback._id)
                .populate('user', 'name email phone')
                .populate('product', 'name');

            const user = populatedFeedback.user;
            const product = populatedFeedback.product;

            const emailBody = `
⚠️ A user submitted a low rating (${rating}) for the product:

🛍️ Product: ${product?.name || 'Unknown Product'}
🧑 Name: ${user?.name || 'N/A'}
📧 Email: ${user?.email || 'N/A'}
📱 Phone: ${user?.phone || 'N/A'}

📝 Message:
${message || 'No message'}

📦 Order ID: ${orderId}
`;

            await sendEmail(
                process.env.EMAIL_USER,
                `⚠️ New Bad Review: ${product?.title || 'Product'}`,
                emailBody
            );
        }

        res.status(201).json({ message: 'Feedback submitted', feedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductFeedbackStats = async (req, res) => {
    try {
        const { productId } = req.params;

        const stats = await Feedback.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({ avgRating: 0, totalReviews: 0 });
        }

        res.json(stats[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbackForProduct = async (req, res) => {
    try {
        const feedback = await Feedback.find({ product: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('user', 'name email')
            .populate('product', 'title')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        await Feedback.findByIdAndDelete(id);
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbackAnalytics = async (req, res) => {
    try {
        const stats = await Feedback.aggregate([
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format into { "1": 2, "2": 5, "3": 10, ... }
        const formatted = {};
        for (let i = 1; i <= 5; i++) {
            const entry = stats.find(s => s._id === i);
            formatted[i] = entry ? entry.count : 0;
        }

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
