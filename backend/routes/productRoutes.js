const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const parser = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Admin only
router.post(
    '/',
    isAuthenticated,
    isAdmin,
    parser.fields([
        { name: 'images' },       // main product images
        { name: 'colorImages' }  // optional color-wise images
    ]),
    createProduct
);

router.put('/:id', isAuthenticated, isAdmin, updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;
