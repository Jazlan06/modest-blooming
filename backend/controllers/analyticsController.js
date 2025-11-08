const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Visit = require('../models/Visit');
const Sale = require('../models/Sale');
const mongoose = require('mongoose');

// Helper: start/end of today
const getTodayRange = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return { todayStart, todayEnd };
};

// --- Log Visit ---
const logVisit = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' });

        await Visit.create({
            userId: req.user?.id || null,
            sessionId,
            visitedAt: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('logVisit error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Coupon usage stats ---
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

// --- Sales report ---
const getSalesReport = async (req, res) => {
    try {
        const sales = await Sale.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    let: { start: '$startDate', end: '$endDate' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$status', 'completed'] },
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

// --- Orders by date range ---
const getOrdersByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: 'completed'
        })
            .populate('user', 'name email')
            .populate('products.product', 'title price');

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('getOrdersByDateRange error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Top 10 selling products ---
const getTopSellingProducts = async (req, res) => {
    try {
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
            { $limit: 10 },
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

// --- User analytics ---
const getUserRegistrationCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, data: { totalUsers: count } });
    } catch (error) {
        console.error('getUserRegistrationCount error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getActiveUsersToday = async (req, res) => {
    try {
        const { todayStart, todayEnd } = getTodayRange();
        const activeUsers = await Visit.distinct('userId', {
            userId: { $ne: null },
            visitedAt: { $gte: todayStart, $lte: todayEnd }
        });
        res.json({ success: true, data: { activeUsersCount: activeUsers.length } });
    } catch (error) {
        console.error('getActiveUsersToday error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getUsersWithRepeatedOrders = async (req, res) => {
    try {
        const users = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$user', ordersCount: { $sum: 1 } } },
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

// --- Paginated lists ---
const getActiveUsersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { todayStart, todayEnd } = getTodayRange();

        const userIds = await Visit.distinct('userId', {
            userId: { $ne: null },
            visitedAt: { $gte: todayStart, $lte: todayEnd }
        });

        const total = userIds.length;
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email createdAt')
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('getActiveUsersList error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getRepeatedUsersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const usersAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$user', ordersCount: { $sum: 1 } } },
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
                    email: '$userDetails.email',
                    createdAt: '$userDetails.createdAt'
                }
            },
            { $sort: { ordersCount: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        // total count separately
        const totalCountAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$user', ordersCount: { $sum: 1 } } },
            { $match: { ordersCount: { $gt: 1 } } },
            { $count: 'total' }
        ]);

        const total = totalCountAgg[0]?.total || 0;

        res.json({
            success: true,
            data: usersAgg,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('getRepeatedUsersList error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    logVisit,
    getCouponUsageStats,
    getSalesReport,
    getOrdersByDateRange,
    getTopSellingProducts,
    getUserRegistrationCount,
    getActiveUsersToday,
    getUsersWithRepeatedOrders,
    getActiveUsersList,
    getRepeatedUsersList
};