const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
// const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// --- Sales & Coupon Analytics ---

// 1. Coupon usage stats (usage count for each coupon)
const getCouponUsageStats = async (req, res) => {
    try {
        const coupons = await Coupon.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'couponApplied',
                    as: 'orders'
                }
            },
            {
                $project: {
                    code: 1,
                    discountType: 1,
                    discountValue: 1,
                    usageCount: { $size: '$orders' }
                }
            }
        ]);
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error('getCouponUsageStats error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 2. Sales report for every sale event (Sale model)
const Sale = require('../models/Sale');
const getSalesReport = async (req, res) => {
    try {
        // Get all sales with total revenue generated in that sale period
        const sales = await Sale.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    let: { start: '$startDate', end: '$endDate' },
                    pipeline: [
                        { $match: { status: 'completed' } },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gte: ['$createdAt', '$$start'] },
                                        { $lte: ['$createdAt', '$$end'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    totalRevenue: { $sum: '$orders.totalAmount' },
                    orderCount: { $size: '$orders' }
                }
            },
            {
                $project: {
                    title: 1,
                    type: 1,
                    startDate: 1,
                    endDate: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            }
        ]);
        res.json({ success: true, data: sales });
    } catch (error) {
        console.error('getSalesReport error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 3. Orders based on custom selected date range (query params: startDate, endDate)
const getOrdersByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        const orders = await Order.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            status: 'completed'
        }).populate('user', 'name email')
            .populate('products.product', 'title price');

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('getOrdersByDateRange error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 4. Top 10 selling products
const getTopSellingProducts = async (req, res) => {
    try {
        const limit = 10;

        const topProducts = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalQuantity: { $sum: '$products.quantity' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 1,
                    totalQuantity: 1,
                    title: '$productDetails.title',
                    price: '$productDetails.price',
                    category: '$productDetails.category',
                    slug: '$productDetails.slug'
                }
            }
        ]);

        res.json({ success: true, data: topProducts });
    } catch (error) {
        console.error('getTopSellingProducts error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- User Activity Analytics ---

// 1. Total user registrations count
const getUserRegistrationCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, data: { totalUsers: count } });
    } catch (error) {
        console.error('getUserRegistrationCount error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 2. Active users today (users who placed order today)
const getActiveUsersToday = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const activeUsers = await Order.distinct('user', {
            status: 'completed',
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        res.json({ success: true, data: { activeUsersCount: activeUsers.length, activeUsers } });
    } catch (error) {
        console.error('getActiveUsersToday error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 3. Users who placed repeated orders (> 1)
const getUsersWithRepeatedOrders = async (req, res) => {
    try {
        const users = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$user',
                    ordersCount: { $sum: 1 }
                }
            },
            { $match: { ordersCount: { $gt: 1 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: 1,
                    ordersCount: 1,
                    name: '$userDetails.name',
                    email: '$userDetails.email'
                }
            }
        ]);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('getUsersWithRepeatedOrders error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// // --- Feedback Management ---

// // Create feedback
// const createFeedback = async (req, res) => {
//   try {
//     const { userId, message, rating } = req.body;
//     const feedback = new Feedback({ user: userId, message, rating });
//     await feedback.save();
//     res.status(201).json({ success: true, data: feedback });
//   } catch (error) {
//     console.error('createFeedback error:', error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// // Get all feedbacks (admin)
// const getAllFeedback = async (req, res) => {
//   try {
//     const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
//     res.json({ success: true, data: feedbacks });
//   } catch (error) {
//     console.error('getAllFeedback error:', error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// // Delete feedback (admin)
// const deleteFeedback = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Feedback.findByIdAndDelete(id);
//     res.json({ success: true, message: 'Feedback deleted' });
//   } catch (error) {
//     console.error('deleteFeedback error:', error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

module.exports = {
    getCouponUsageStats,
    getSalesReport,
    getOrdersByDateRange,
    getTopSellingProducts,
    getUserRegistrationCount,
    getActiveUsersToday,
    getUsersWithRepeatedOrders,
    //   createFeedback,
    //   getAllFeedback,
    //   deleteFeedback
};
