const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create', isAuthenticated, createRazorpayOrder);

// Verify payment
router.post('/verify', isAuthenticated, verifyPayment);

module.exports = router;