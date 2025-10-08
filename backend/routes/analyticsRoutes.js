const express = require('express');
const {
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
} = require('../controllers/analyticsController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

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


// // Feedback management
// router.post('/feedback', createFeedback); // Can be open to all or protected, your choice
// router.get('/feedback', getAllFeedback);
// router.delete('/feedback/:id', deleteFeedback);

module.exports = router;
