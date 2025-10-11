const express = require('express');
const {
    createProduct,
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
router.put('/:id', isAuthenticated, isAdmin, updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;