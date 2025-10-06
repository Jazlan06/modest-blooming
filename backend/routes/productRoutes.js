const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', isAuthenticated, isAdmin, createProduct);
router.put('/:id', isAuthenticated, isAdmin, updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;
