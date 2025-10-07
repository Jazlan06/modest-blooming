const express = require('express');
const {
  createSale,
  updateSale,
  deleteSale,
  getAllSales,
  getActiveSales
} = require('../controllers/saleController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.post('/', isAuthenticated, isAdmin, createSale);
router.put('/:id', isAuthenticated, isAdmin, updateSale);
router.delete('/:id', isAuthenticated, isAdmin, deleteSale);

// Public/admin
router.get('/', getAllSales);
router.get('/active', getActiveSales);

module.exports = router;
