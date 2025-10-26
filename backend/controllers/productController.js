const Product = require('../models/Product');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

// Create Product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, discountPrice, category, tags, colors, groupId, weight, quantity } = req.body;
        const slug = slugify(name, { lower: true });

        const media = req.files?.images?.map(file => file.path) || [];
        const parsedColors = colors ? JSON.parse(colors) : [];
        const colorImages = req.files?.colorImages || [];

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
            weight: Number(weight),
            quantity: Number(quantity) || 0
        });

        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Search Products
const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ message: 'Search query missing' });

        const regex = new RegExp(query, 'i');
        const results = await Product.find({
            $or: [
                { name: regex },
                { tags: regex },
                { category: regex },
                { description: regex }
            ]
        }).sort({ createdAt: -1 }).limit(15);

        if (results.length === 0) return res.status(404).json({ message: 'No products found' });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const filterProducts = async (req, res) => {
    console.log('FILTER QUERY:', req.query);
    try {
        const { category, minPrice, maxPrice, tags, colors, inStock, bestSelling, minWeight, maxWeight } = req.query;
        const filter = {};

        // ✅ Category
        if (category) {
            const categoryList = category.split(',').map(c => c.trim());
            filter.category = { $in: categoryList };
        }

        // ✅ Price Range
        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);

            // Match either main price or discount price
            filter.$and = [
                {
                    $or: [
                        { price: priceFilter },
                        { discountPrice: priceFilter }
                    ]
                }
            ];
        }

        // ✅ Tags or search keywords
        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { tags: { $in: tagList } },
                    { name: { $regex: tagList.join('|'), $options: 'i' } },
                    { description: { $regex: tagList.join('|'), $options: 'i' } }
                ]
            });
        }

        // ✅ Colors
        if (colors) {
            const colorList = colors.split(',').map(c => c.trim());
            filter.$and = filter.$and || [];
            filter.$and.push({ 'colors.colorName': { $in: colorList } });
        }

        // ✅ Stock status
        if (inStock === 'true') {
            filter.inStock = true;
        }

        // ✅ Best selling
        if (bestSelling === 'true') {
            filter.bestSelling = true;
        }

        // ✅ Weight range
        if (minWeight || maxWeight) {
            const weightFilter = {};
            if (minWeight) weightFilter.$gte = Number(minWeight);
            if (maxWeight) weightFilter.$lte = Number(maxWeight);
            filter.$and = filter.$and || [];
            filter.$and.push({ weight: weightFilter });
        }

        // 🔍 Debug log (optional)
        console.log('Applied filters:', JSON.stringify(filter, null, 2));

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while filtering products' });
    }
};

// Get Filter Options
const getFilterOptions = async (req, res) => {
    try {
        const products = await Product.find();

        const categoryCounts = products.reduce((acc, p) => {
            if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

        const colorCounts = products.reduce((acc, p) => {
            p.colors.forEach(c => {
                const colorName = c.colorName?.trim();
                if (colorName) acc[colorName] = (acc[colorName] || 0) + 1;
            });
            return acc;
        }, {});
        const colors = Object.entries(colorCounts).map(([color, count]) => ({ color, count }));

        const prices = products.flatMap(p => [
            ...(p.colors?.map(c => c.price) || []),
            p.discountPrice,
            p.price
        ]).filter(Boolean);
        const priceRange = {
            min: prices.length ? Math.min(...prices) : 0,
            max: prices.length ? Math.max(...prices) : 3000
        };

        const allTags = [...new Set(products.flatMap(p => p.tags || []))];

        res.json({
            categories,
            colors,
            priceRange,
            tags: allTags,
            allProducts: products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching filter options' });
    }
};

// Clone Product Variant
const cloneProductAsVariant = async (req, res) => {
    try {
        const originalProduct = await Product.findById(req.params.id);
        if (!originalProduct) return res.status(404).json({ message: 'Original product not found' });

        const { colorName, colorCode, price, discountPrice, quantity, weight } = req.body;
        const media = req.files?.images?.map(file => file.path) || [];

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
            price: originalProduct.price,
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
        res.status(201).json({ message: 'Variant created', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Other CRUD methods
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
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
        const { name, description, price, discountPrice, category, tags, colors, weight, quantity } = req.body;

        const updatedData = {
            name,
            description,
            price,
            discountPrice,
            category,
            tags: tags ? JSON.parse(tags) : [],
            colors: colors ? JSON.parse(colors) : [],
            weight,
            quantity,
        };

        if (req.files?.images) {
            const newImages = req.files.images.map(file => file.path);
            updatedData.media = [...newImages];
        }

        if (req.files?.colorImages) {
            const newColorImages = req.files.colorImages.map(file => file.path);
            const updatedColors = updatedData.colors.map((color, index) => ({
                ...color,
                image: newColorImages[index] || color.image,
            }));
            updatedData.colors = updatedColors;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
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
    getFilterOptions,
    cloneProductAsVariant,
    getAllProducts,
    getProduct,
    getProductVariants,
    getVariantPriceById,
    getProductVariantWeight,
    updateProduct,
    deleteProduct
};