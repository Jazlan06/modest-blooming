const express = require('express');
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  applyCoupon
} = require('../controllers/couponController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.post('/', isAuthenticated, isAdmin, createCoupon);
router.put('/:id', isAuthenticated, isAdmin, updateCoupon);
router.delete('/:id', isAuthenticated, isAdmin, deleteCoupon);

// Public/admin get
router.get('/', isAuthenticated, isAdmin, getAllCoupons);

// User apply coupon
router.post('/apply', isAuthenticated, applyCoupon);

module.exports = router;