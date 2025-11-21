const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { createRazorpayOrder, verifyAndCreateOrder } = require("../controllers/paymentController");

// Create Razorpay order
router.post('/create-temp', isAuthenticated, createRazorpayOrder);

// Verify payment
router.post('/verify', isAuthenticated, verifyAndCreateOrder);

module.exports = router;