const Product = require('../models/Product');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');


const createProduct = async (req, res) => {
    try {
        const { name, description, price, discountPrice, category, tags, colors, groupId, weight } = req.body;
        const slug = slugify(name, { lower: true });

        // Upload product images/videos
        const media = req.files['images']?.map(file => file.path) || [];

        // Parse color data from req.body.colors (should be JSON string)
        const parsedColors = colors ? JSON.parse(colors) : [];

        // Map each color with its image
        const colorImages = req.files['colorImages'] || [];

        const finalColors = parsedColors.map((color, index) => ({
            ...color,
            image: colorImages[index]?.path || ''
        }));

        const product = new Product({
            name,
            slug,
            description,
            price,
            discountPrice,
            category,
            tags: tags ? JSON.parse(tags) : [],
            colors: finalColors,
            media,
            groupId: groupId || uuidv4(),
            weight: Number(weight)
        });

        await product.save();
        res.status(201).json(product);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ message: 'Search query missing' });
        }

        const regex = new RegExp(query, 'i'); // 'i' = case-insensitive

        const results = await Product.find({
            $or: [
                { name: regex },
                { tags: regex },
                { category: regex },
                { description: regex }
            ]
        }).sort({ createdAt: -1 }).limit(15);

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const filterProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      tags,
      colors,
      inStock,
      bestSelling,
      minWeight,
      maxWeight
    } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.discountPrice = {};
      if (minPrice) filter.discountPrice.$gte = Number(minPrice);
      if (maxPrice) filter.discountPrice.$lte = Number(maxPrice);
    }

    // Tags filter (comma-separated)
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagList };
    }

    // Color filter (comma-separated)
    if (colors) {
      const colorList = colors.split(',').map(c => c.trim());
      filter['colors.colorName'] = { $in: colorList };
    }

    // Stock filter
    if (inStock === 'true') {
      filter.inStock = true;
    }

    // Best selling
    if (bestSelling === 'true') {
      filter.bestSelling = true;
    }

    // Weight range filter
    if (minWeight || maxWeight) {
      filter.weight = {};
      if (minWeight) filter.weight.$gte = Number(minWeight);
      if (maxWeight) filter.weight.$lte = Number(maxWeight);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const cloneProductAsVariant = async (req, res) => {
    try {
        const originalProduct = await Product.findById(req.params.id);
        if (!originalProduct)
            return res.status(404).json({ message: 'Original product not found' });

        const {
            colorName,
            colorCode,
            price, // optional: per-variant
            discountPrice, // optional
            quantity,
            weight //optional
        } = req.body;

        // Upload media (images/videos)
        const media = req.files['images']?.map(file => file.path) || [];

        // Build new color object with optional price
        const newColor = {
            colorName,
            colorCode,
            image: media[0] || '',
            ...(price && { price: Number(price) }),
            ...(discountPrice && { discountPrice: Number(discountPrice) }),
            ...(weight && { weight: Number(weight) })
        };

        const newProduct = new Product({
            name: originalProduct.name,
            slug: slugify(`${originalProduct.name}-${colorName}`, { lower: true }),
            description: originalProduct.description,
            price: originalProduct.price, // fallback price
            discountPrice: originalProduct.discountPrice,
            category: originalProduct.category,
            tags: originalProduct.tags,
            colors: [newColor],
            media,
            groupId: originalProduct.groupId || uuidv4(),
            quantity: quantity || 0,
            inStock: true,
            weight: Number(weight) || originalProduct.weight
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Variant created',
            product: newProduct
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
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

const getProductVariants = async (req, res) => {
    try {
        const variants = await Product.find({ groupId: req.params.groupId });
        res.json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getVariantPriceById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const colorName = req.params.colorName;
        const color = product.colors.find(c => c.colorName.toLowerCase() === colorName.toLowerCase());

        const price = color?.price || product.price;
        const discount = color?.discountPrice || product.discountPrice;

        res.json({ price, discount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProductVariantWeight = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const selectedColor = req.params.colorName;
        const color = product.colors.find(c => c.colorName === selectedColor);
        const weight = color?.weight || product.weight;

        res.json({ weight });
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
    searchProducts,
    filterProducts,
    cloneProductAsVariant,
    getAllProducts,
    getProduct,
    getProductVariants,
    getVariantPriceById,
    getProductVariantWeight,
    updateProduct,
    deleteProduct
};
