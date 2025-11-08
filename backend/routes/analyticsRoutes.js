const express = require('express');
const {
    logVisit,
    getCouponUsageStats,
    getSalesReport,
    getOrdersByDateRange,
    getTopSellingProducts,
    getUserRegistrationCount,
    getActiveUsersToday,
    getUsersWithRepeatedOrders,
    getActiveUsersList,
    getRepeatedUsersList,
} = require('../controllers/analyticsController');

const { isAuthenticated, isAdmin, isAuthenticatedOptional } = require('../middleware/auth');

const router = express.Router();

//Active User Today(Visit)
router.post('/log-visit', isAuthenticatedOptional, logVisit);
// Protect all routes to admin only
router.use(isAuthenticated, isAdmin);

// Sales & Coupon Analytics
router.get('/coupon-usage', getCouponUsageStats);
router.get('/sales-report', getSalesReport);
router.get('/orders-by-date', getOrdersByDateRange);
router.get('/top-products', getTopSellingProducts);

// User Activity Analytics
router.get('/user-registrations', getUserRegistrationCount);
router.get('/active-users-today', getActiveUsersToday);
router.get('/repeated-users', getUsersWithRepeatedOrders);

//List
router.get('/active-users-list', getActiveUsersList);
router.get('/repeated-users-list', getRepeatedUsersList);

module.exports = router;