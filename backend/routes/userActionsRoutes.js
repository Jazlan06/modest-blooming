const express = require('express');
const {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getUserCartWishlist
} = require('../controllers/userActionsController');

const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Cart
router.post('/cart/:productId', isAuthenticated, addToCart);
router.delete('/cart/:productId', isAuthenticated, removeFromCart);

// Wishlist
router.post('/wishlist/:productId', isAuthenticated, addToWishlist);
router.delete('/wishlist/:productId', isAuthenticated, removeFromWishlist);

// Get both
router.get('/my', isAuthenticated, getUserCartWishlist);

module.exports = router;
