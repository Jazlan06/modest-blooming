const Product = require('../models/Product');
const Sale = require('../models/Sale');
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
            quantity: Number(quantity) || 0,
            bestSelling: req.body.bestSelling === 'true',
            isParent: true
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
        const { category, minPrice, maxPrice, tags, colors, inStock, bestSelling, newArrival, sale, minWeight, maxWeight } = req.query;
        const filter = {};

        // ✅ Sale filter
        if (sale === 'true') {
            const now = new Date();
            const activeSales = await Sale.find({
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            if (!activeSales.length) return res.json([]);

            const globalSale = activeSales.find(s => s.type === 'global');
            if (!globalSale) {
                const saleCategories = activeSales.flatMap(s => s.categories || []);
                filter.category = { $in: saleCategories };
            }
        }

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

        // ✅ New arrivals (last 30 days)
        if (newArrival === 'true') {
            const THIRTY_DAYS_AGO = new Date();
            THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
            filter.$and = filter.$and || [];
            filter.$and.push({ createdAt: { $gte: THIRTY_DAYS_AGO } });
        }

        // ✅ Weight range
        if (minWeight || maxWeight) {
            const weightFilter = {};
            if (minWeight) weightFilter.$gte = Number(minWeight);
            if (maxWeight) weightFilter.$lte = Number(maxWeight);
            filter.$and = filter.$and || [];
            filter.$and.push({ weight: weightFilter });
        }

        // 🔍 Debug log
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
        const filter = {};
        let products = [];

        // ✅ Handle Sale products
        if (req.query.sale === 'true') {
            const now = new Date();
            const activeSales = await Sale.find({
                startDate: { $lte: now },
                endDate: { $gte: now },
            });

            if (!activeSales.length) {
                return res.json({
                    categories: [],
                    colors: [],
                    priceRange: { min: 0, max: 0 },
                    tags: [],
                    allProducts: [],
                });
            }

            const globalSale = activeSales.find((sale) => sale.type === 'global');
            if (globalSale) {
                // Global sale = all parent products
                products = await Product.find({ isParent: true });
            } else {
                // Category-specific sale
                const saleCategories = activeSales.flatMap((sale) => sale.categories || []);
                products = await Product.find({
                    category: { $in: saleCategories },
                    isParent: true,
                });
            }
        }

        // ✅ Handle Best Selling
        else if (req.query.bestSelling === 'true') {
            products = await Product.find({ bestSelling: true });
        }

        // ✅ Handle New Arrivals (last 30 days)
        else if (req.query.newArrival === 'true') {
            const THIRTY_DAYS_AGO = new Date();
            THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
            products = await Product.find({ createdAt: { $gte: THIRTY_DAYS_AGO } });
        }

        // ✅ Default (all)
        else {
            products = await Product.find({});
        }

        // 🧩 Category counts
        const categoryCounts = products.reduce((acc, p) => {
            if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        const categories = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count,
        }));

        // 🧩 Colors
        const colorCounts = products.reduce((acc, p) => {
            (p.colors || []).forEach((c) => {
                const colorName = c.colorName?.trim();
                if (colorName) acc[colorName] = (acc[colorName] || 0) + 1;
            });
            return acc;
        }, {});
        const colors = Object.entries(colorCounts).map(([color, count]) => ({
            color,
            count,
        }));

        // 🧩 Price range
        const prices = products
            .flatMap((p) => [
                ...(p.colors?.map((c) => c.price) || []),
                p.discountPrice,
                p.price,
            ])
            .filter(Boolean);

        const priceRange = {
            min: prices.length ? Math.min(...prices) : 0,
            max: prices.length ? Math.max(...prices) : 3000,
        };

        // 🧩 Tags
        const allTags = [...new Set(products.flatMap((p) => p.tags || []))];

        res.json({
            categories,
            colors,
            priceRange,
            tags: allTags,
            allProducts: products,
        });
    } catch (err) {
        console.error('Error in getFilterOptions:', err);
        res
            .status(500)
            .json({ message: 'Server error fetching filter options' });
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
            weight: Number(weight) || originalProduct.weight,
            isParent: false,
            parentProduct: originalProduct._id,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Variant created', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Add new color to an existing product (instead of cloning)
const addColorToProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { colorName, colorCode, price, discountPrice, quantity, weight } = req.body;
        const media = req.files?.images?.map(file => file.path) || [];

        const newColor = {
            colorName,
            colorCode,
            images: media, // updated to array
            ...(price && { price: Number(price) }),
            ...(discountPrice && { discountPrice: Number(discountPrice) }),
            ...(weight && { weight: Number(weight) }),
            ...(quantity && { quantity: Number(quantity) })
        };

        product.colors.push(newColor);
        await product.save();

        res.status(200).json({ message: 'Color added successfully', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Other CRUD methods
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = { isParent: true };

        // ✅ Best Selling
        if (req.query.bestSelling === 'true') {
            filter.bestSelling = true;
        }

        // ✅ New Arrivals
        if (req.query.newArrival === 'true') {
            const THIRTY_DAYS_AGO = new Date();
            THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
            filter.createdAt = { $gte: THIRTY_DAYS_AGO };
        }

        // ✅ Sale Products
        if (req.query.sale === 'true') {
            const now = new Date();
            const activeSales = await Sale.find({
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            if (!activeSales.length) {
                return res.json({
                    products: [],
                    totalProducts: 0,
                    currentPage: page,
                    totalPages: 1
                });
            }

            const globalSale = activeSales.find(s => s.type === 'global');
            if (!globalSale) {
                const saleCategories = activeSales.flatMap(s => s.categories || []);
                filter.category = { $in: saleCategories };
            }
            // global sale → no category restriction (includes all)
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter)
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
        console.error("Error fetching products:", error);
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
        const { name, description, price, discountPrice, category, tags, colors, weight, quantity, bestSelling } = req.body;

        // Parse JSON strings if needed
        const parsedColors = colors ? JSON.parse(colors) : [];
        const parsedTags = tags ? JSON.parse(tags) : [];

        // Fetch existing product
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

        // Base updated fields
        const updatedData = {
            name,
            description,
            price,
            discountPrice,
            category,
            tags: parsedTags,
            weight,
            quantity,
            bestSelling: bestSelling === 'true',
        };

        // Handle main product images
        if (req.files?.images) {
            const newImages = req.files.images.map(file => file.path);
            updatedData.media = newImages;
        } else {
            updatedData.media = existingProduct.media;
        }

        // Handle color images
        const uploadedColorImages = req.files?.colorImages || [];
        let imageFileIndex = 0;

        const updatedColors = parsedColors.map((color) => {
            const oldColor = existingProduct.colors.find(c => c.colorName === color.colorName);

            // Collect new images for this color
            const newImages = [];
            if (color.images?.length > 0) {
                color.images.forEach(img => {
                    // If frontend sent a File object, assign uploaded image
                    if (img === null && uploadedColorImages[imageFileIndex]) {
                        newImages.push(uploadedColorImages[imageFileIndex].path);
                        imageFileIndex++;
                    } else if (typeof img === 'string') {
                        newImages.push(img);
                    }
                });
            }

            return {
                ...color,
                images: newImages.length > 0 ? newImages : oldColor?.images || [],
            };
        });

        updatedData.colors = updatedColors;

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
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
    addColorToProduct,
    getAllProducts,
    getProduct,
    getProductVariants,
    getVariantPriceById,
    getProductVariantWeight,
    updateProduct,
    deleteProduct
};