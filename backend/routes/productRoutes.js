const express = require('express');
const Product = require('../models/Product')
const {
    createProduct,
    searchProducts,
    filterProducts,
    getFilterOptions,
    cloneProductAsVariant,
    addColorToProduct,
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
router.get('/slug/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
router.post('/wishlist-details', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid product IDs" });
        }

        const products = await Product.find({ _id: { $in: ids } });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch wishlist products" });
    }
});

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
router.post(
    '/:id/add-color',
    isAuthenticated,
    isAdmin,
    parser.fields([{ name: 'images' }]),
    addColorToProduct
);
router.put('/:id', isAuthenticated, isAdmin, parser.fields([
    { name: 'images' },       // for regular product images
    { name: 'colorImages' }    // for color-specific images
]), updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;