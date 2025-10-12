const express = require('express');
const {
  placeOrder,
  updateOrderStatus,
  getMyOrders,
  getAllOrders
} = require('../controllers/orderController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Place an order
router.post('/', isAuthenticated, placeOrder);
// Get orders of logged-in user
router.get('/my', isAuthenticated, getMyOrders);
// Admin: update status
router.put('/:id/status', isAuthenticated, isAdmin, updateOrderStatus);
// Admin: get all orders
router.get('/', isAuthenticated, isAdmin, getAllOrders);

module.exports = router;