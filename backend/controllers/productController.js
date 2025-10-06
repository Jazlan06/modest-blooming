const Product = require('../models/Product');
const slugify = require('slugify');

const createProduct = async (req, res) => {
    try {
        const { title, description, price, discountPrice, category, tags, colors } = req.body;
        const slug = slugify(title, { lower: true });

        // Upload product images
        const images = req.files['images']?.map(file => file.path) || [];

        // Parse color data from req.body.colors (should be JSON string)
        const parsedColors = colors ? JSON.parse(colors) : [];

        // Map each color with its image
        const colorImages = req.files['colorImages'] || [];

        const finalColors = parsedColors.map((color, index) => ({
            ...color,
            image: colorImages[index]?.path || ''
        }));

        const product = new Product({
            title,
            slug,
            description,
            price,
            discountPrice,
            category,
            tags: tags ? JSON.parse(tags) : [],
            colors: finalColors,
            images
        });

        await product.save();
        res.status(201).json(product);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
};
