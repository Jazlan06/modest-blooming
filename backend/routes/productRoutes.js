const express = require('express');
const {
    createProduct,
    searchProducts,
    filterProducts,
    getFilterOptions,
    cloneProductAsVariant,
    getAllProducts,
    getProduct,
    getProductVariants,
    getVariantPriceById,
    getProductVariantWeight,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const parser = require('../middleware/productUpload');
const router = express.Router();
// Public
router.get('/search', searchProducts);
router.get('/filter', filterProducts);
router.get('/filter-options', getFilterOptions);
router.get('/', getAllProducts);
router.get('/variants/:groupId', getProductVariants);
router.get('/:id/weight/:colorName', getProductVariantWeight);
router.get('/:id/price/:colorName', getVariantPriceById);
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
router.post(
    '/:id/clone',
    isAuthenticated,
    isAdmin,
    parser.fields([
        { name: 'images' } // variant's image(s)/video(s)
    ]),
    cloneProductAsVariant
);
router.put('/:id', isAuthenticated, isAdmin, parser.fields([
    { name: 'images' },       // for regular product images
    { name: 'colorImages' }    // for color-specific images
]), updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;