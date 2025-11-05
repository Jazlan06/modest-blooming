I'm creating an ecommerce website for hijab & other accessories like jilbab, zikr etc etc products for business named Modest Blooming. So i was using and currently too using chatgpt free so browser crashed so starting from all over. So now i'll paste the project descrip[tion and code, so we can start smoothly like every file?
:


Description :
1. Planning & Requirements Breakdown

List Features: Break down your requirements into smaller features/modules. For example:

User Authentication (Login, Signup, Forgot Password)

Product Management (CRUD products, categories, colors)

Coupon Management

Order Management (Cart, Wishlist, Checkout, Order Tracking)

CMS Content Management (Home page content, banners, sales)

Analytics & Reports

Payment Integration (Indian UPI)

UI Components (Header, Footer, Product Cards, Sliders)

Data Modeling: Sketch your MongoDB schema designs. At minimum:

User Schema

Product Schema (with images, colors, categories, price, quantity)

Coupon Schema

Order Schema

CMS Content Schema (for homepage, banners, etc.)

Analytics Schema (tracking orders, sales, user activity)

2. Tech Stack Setup

Initialize your backend with Node.js + Express and MongoDB.

Use Mongoose for schema modeling and DB interactions.

Setup authentication using JWT or Passport.js.

For images, integrate Cloudinary for uploads and storage.

Initialize frontend with Vite + React + Tailwind CSS.

Plan component hierarchy: common UI components (Header, Footer), pages, and reusable components (Product Card, Slider, Filters).

3. Start Backend API Development

Build out the core APIs first:

User Authentication (register/login/forgot password)

Product CRUD APIs (including image upload handling with Cloudinary)

Coupon CRUD APIs

Order APIs (create order, update order status)

CMS APIs (update home page content, banners, sales)

Test APIs with tools like Postman as you build.

4. Build Admin Panel (CMS)

Start with a separate frontend project or admin routes inside the main frontend.

Implement authentication for the admin panel.

Build forms/pages for managing:

Products (with image uploads)

Coupons

Home page content (banners, sales info)

Order status updates

Analytics dashboards (can be simple charts with a library like Chart.js)

5. Frontend User Website

After backend APIs and CMS admin panel are stable, start the customer-facing website.

Implement:

Homepage (dynamic content from CMS)

Shop page with filters and product listings

Product detail page (image slider, colors, quantity selector)

Cart and Wishlist features (state management with Context API or Redux)

Checkout with UPI payment integration (e.g., Razorpay, PhonePe, or Paytm APIs)

6. Integrate Payment Gateway

Research and choose an Indian UPI-compatible payment gateway.

Implement payment in the checkout flow with proper verification and order confirmation.

7. Testing & Optimization

Write unit and integration tests for critical parts.

Test UI responsiveness and cross-browser compatibility.

Optimize API performance and frontend loading times.

8. Deployment

Deploy backend on services like Heroku, AWS, or DigitalOcean.

Deploy frontend on Vercel, Netlify, or similar.

Connect your domain and set up SSL certificates. 
:
So i was building the backend first, so was done with auth, product, coupon management, sale maangement, cms for home page as owner wants everything controlled dynamically using cms/admin/owner & userActions like wishlist & cart, we didn't completed the checkout & order feature as the owner didn't updated me how will the delivery charges will be applicable so this and billing will be done when updated, so we were working on analytics lastly so lets start with it.


# 12/10/25

## Prompt

Okay now we gonna implement the logic for delivery rate calculation beased on total cart weight & location. Lets do the delivery rate calculation logic first. So we gonna take address of user state, city, pincode, locality(like i live in mazgaon, dockyard), street address, apartmennt/house address. Business is located at Dockyard Road, mumbai - so delivery agent gave me this rate :
1. Mumbai, Navi Mumbai, Thane & nearby - 50/kg.
2. Whole Maharashtra Except (1) - 60/kg.
3. Whole Gujrat - 70/kg
4. Rest nearby states - 80/kg
5. North & North East(like jammu&kashmir, manipur,etc) - 140/kg
6. where they cant reach(1-4) they'll do dtdc - 100/kg .
:
so the weight will be calculated for each product & it's quantity, if the customers neeed a hamper an additional 0.25kg will be added in end weight with products. Then total weight will be calculated and based on user location delivery rate will be applicable. If the total weight sums up 1.05 kg as example it will be calculated as 2 kg means anything above 1 kg will be calculated 2kg and anything above 2kg will be calculated 3 kg and hence. 


##
i'm building a website for smalll business - Modest Blooming - Hijab & Other Accessories bussiness. So i created the backend now assisst me building a professional, rich looking UI with good styling and font style, etc. I'm using MERN with NextJS (basic like pages/ goes for routing ) & for styling using TailwindCSS.So i'll paste the backend then frontend and tell what to do 
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
            quantity: Number(quantity) || 0,
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

        const totalProducts = await Product.countDocuments({ isParent: true });
        const products = await Product.find({ isParent: true })
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
# frontend/:
components/:
ProductGrid.js:
import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductGrid = ({ products }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('http://localhost:5000/api/user/my', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data?.wishlist && Array.isArray(data.wishlist)) {
                setWishlist(data.wishlist.map(item => item._id));
            } else {
                console.warn('Wishlist data missing or invalid:', data);
                setWishlist([]);
            }

        };

        fetchWishlist();
    }, []);

    const handleWishlistToggle = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to use wishlist');
            return;
        }

        const isInWishlist = wishlist.includes(productId);
        const url = `http://localhost:5000/api/user/wishlist/${productId}`;
        const method = isInWishlist ? 'DELETE' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                ...(method === 'POST' ? { body: JSON.stringify({ productId }) } : {}),
            });

            const data = await res.json();
            setWishlist(data.wishlist.map(id => typeof id === 'string' ? id : id._id));
        } catch (err) {
            console.error('Wishlist error:', err);
        }
    };

    return (
        <>
            <Navbar />
            <section className="py-12">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-display mb-8">Featured Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 px-2">
                        {products.map(product => (
                            <Link key={product._id} href={`/product/${product.slug || product._id}`} passHref>
                                <div className="bg-white shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer mb-4 relative">
                                    {/* Image Carousel */}
                                    <div className="overflow-hidden">
                                        <img
                                            src={product.media[0]}
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition duration-300 ease-in-out hover:scale-110"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 flex flex-col justify-between h-full relative">
                                        {/* Product Name + Wishlist Icon */}
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold font-heading text-primary text-left truncate w-full">
                                                {product.name}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleWishlistToggle(product._id);
                                                }}
                                                aria-label="Toggle wishlist"
                                                className="ml-2"
                                            >
                                                <FaRegHeart
                                                    className="text-xl transition-colors duration-300"
                                                    style={{
                                                        color: wishlist.includes(product._id) ? '#F4C2C2' : 'rgba(0, 0, 0, 0.3)',
                                                    }}
                                                />
                                            </button>


                                        </div>

                                        {/* Pricing Section */}
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xl font-bold font-body text-accent">
                                                ₹{product.discountPrice || product.price}
                                            </p>
                                            {product.discountPrice && (
                                                <span className="text-lg font-body line-through text-gray-500">
                                                    ₹{product.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductGrid;  
ProductDetail.js:
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const ProductDetail = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(product.media[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]?.colorName);

    const router = useRouter();

    const handleImageChange = (image) => setSelectedImage(image);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Product Image Carousel */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="flex-1">
                        <div className="relative">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-[400px] object-cover rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
                            />
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {product.media.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`image-${index}`}
                                    onClick={() => handleImageChange(image)}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer transition-transform duration-200 transform hover:scale-110"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-semibold text-primary">{product.name}</h1>
                        <div className="flex items-center mt-2">
                            <p className="text-2xl font-bold text-accent">
                                ₹{product.discountPrice || product.price}
                            </p>
                            {product.discountPrice && (
                                <span className="text-xl text-gray-600 line-through ml-2">
                                    ₹{product.price}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-700 mt-4">{product.description}</p>

                        {/* Color/Variant Selector */}
                        <div className="mt-6">
                            <h4 className="text-xl font-semibold text-primary">Choose Color</h4>
                            <div className="flex gap-4 mt-4">
                                {product.colors.map(color => (
                                    <button
                                        key={color.colorName}
                                        className={`w-10 h-10 rounded-full ${color.colorCode} border-2 ${selectedColor === color.colorName ? 'border-accent' : 'border-transparent'}`}
                                        onClick={() => setSelectedColor(color.colorName)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="mt-6">
                            <button
                                className="w-full py-3 bg-accent text-white rounded-lg text-lg font-bold transition duration-300 hover:bg-primary"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetail;  
pages/product/[slug].js:
import ProductDetail from "@/components/ProductDetail"

export default function ProductPage({ product }) {
    return <ProductDetail product={product} />
}

export async function getServerSideProps(context) {
    const { slug } = context.params

    const res = await fetch(`http://localhost:5000/api/products`) // fetch all
    const products = await res.json()

    const product = products.find((p) => p.slug === slug || p._id === slug)

    if (!product) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            product,
        },
    }
}  
pages/products.js:
import ProductGrid from "@/components/ProductGrid"

export default function ProductsPage({ products }) {
    return <ProductGrid products={products} />
}

export async function getServerSideProps() {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        return {
            props: {
                products: Array.isArray(data) ? data : [],
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            props: {
                products: [],
            },
        };
    }
} 
components/Navbar.js:import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaBars, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const inputRef = useRef(null);
    const router = useRouter();
    const { pathname } = router;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            setIsLoggedIn(!!token);

            if (userData) {
                const parsedUser = JSON.parse(userData);
                setRole(parsedUser.role || null); // ✅ set role
            }
        }
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    };

    const handleProfileClick = () => {
        if (isLoggedIn) {
            router.push('/login');
        } else {
            router.push('/register');
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F4C2C2] text-white px-4 shadow-md h-20 md:h-24">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 relative">

                    {/* === Mobile Left Icons === */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="focus:outline-none focus:ring-0">
                            <FaBars size={22} />
                        </button>
                        <button onClick={() => setSearchOpen(!searchOpen)} className="focus:outline-none focus:ring-0 ml-2">
                            <FaSearch size={20} />
                        </button>
                    </div>

                    {/* === Mobile Logo === */}
                    <div className="flex justify-center md:justify-start flex-1 md:flex-none">
                        <Link href="/" className="block w-[150px] md:w-[170px] focus:outline-none focus:ring-0">
                            <Image
                                src="/logo.png"
                                alt="Modest Blooming Logo"
                                width={165}
                                height={50}
                                priority
                            />
                        </Link>
                    </div>

                    {/* === Desktop Navbar === */}
                    <div className="hidden md:flex items-center bg-[#F4C2C2] h-24 px-4 fixed top-0 left-0 right-0 z-50">
                        {/* Logo */}
                        <div className="flex-shrink-0 w-[170px]">
                            <Link href="/" className="block focus:outline-none focus:ring-0">
                                <Image
                                    src="/logo.png"
                                    alt="Modest Blooming Logo"
                                    width={165}
                                    height={50}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative w-[450px] mx-6 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 pr-10 py-2 rounded-full text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#F4C2C2]"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F4C2C2] hover:text-pink-700 focus:outline-none">
                                <FaSearch size={20} />
                            </button>
                        </form>

                        {/* Nav Links */}
                        <div className="flex ml-[100px] items-center gap-8 text-lg font-medium mr-6">
                            <Link href="/" className="hover:underline focus:outline-none focus:ring-0">Home</Link>
                            <Link href="/shop" className="hover:underline focus:outline-none focus:ring-0">Shop</Link>
                            <Link href="/about" className="hover:underline focus:outline-none focus:ring-0">About</Link>
                            <Link href="/contact" className="hover:underline focus:outline-none focus:ring-0">Contact</Link>

                            {role === 'admin' && (
                                <>
                                    <Link href="/admin" className="hover:underline focus:outline-none focus:ring-0 text-yellow-200">Admin</Link>
                                    <Link href="/admin/analytics" className="hover:underline focus:outline-none focus:ring-0 text-yellow-200">Analytics</Link>
                                </>
                            )}
                        </div>

                        {/* Desktop Icons */}
                        <div className="flex items-center gap-6 ml-auto">
                            <FaHeart size={26} className="cursor-pointer" />
                            <FaShoppingCart size={26} className="cursor-pointer" />
                            <FaUserCircle
                                size={28}
                                className="cursor-pointer text-white hover:text-gray-200"
                                onClick={handleProfileClick}
                                title={isLoggedIn ? 'Logout' : 'Register'}
                            />
                        </div>
                    </div>

                    {/* === Mobile Right Icons (no profile here) === */}
                    <div className="flex items-center gap-4 md:hidden">
                        <FaHeart size={22} className="cursor-pointer" />
                        <FaShoppingCart size={22} className="cursor-pointer ml-[5px]" />
                    </div>
                </div>
            </nav>

            {/* === Mobile Search Overlay === */}
            {searchOpen && (
                <div className="fixed top-20 md:hidden left-0 right-0 z-40 bg-white shadow-md py-4 px-6 flex items-center gap-4 transition-all duration-300">
                    <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search Products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] text-black"
                        />
                        <button type="submit" className="bg-[#F4C2C2] text-white px-4 py-2 rounded-md hover:bg-[#f7b0b0] transition-colors focus:outline-none focus:ring-0">
                            Search
                        </button>
                        <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-600 hover:text-black focus:outline-none focus:ring-0">
                            <FaTimes size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* === Mobile Sidebar Menu === */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <aside className="relative bg-white w-72 max-w-full h-full p-8 shadow-2xl rounded-tr-lg rounded-br-lg animate-slide-in-left flex flex-col"
                        style={{ animationDuration: '300ms', animationTimingFunction: 'ease-out' }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close menu"
                            className="self-end mb-6 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4C2C2] rounded"
                        >
                            <FaTimes size={24} />
                        </button>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-6 text-lg font-semibold text-gray-800">
                            {[{ href: '/', label: 'Home' },
                            { href: '/shop', label: 'Shop' },
                            { href: '/about', label: 'About' },
                            { href: '/contact', label: 'Contact' },
                            ...(role === 'admin'
                                ? [
                                    { href: '/admin', label: 'Admin' },
                                    { href: '/admin/analytics', label: 'Analytics' },
                                ]
                                : [])
                            ].map(({ href, label }) => {
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] rounded 
                    ${isActive
                                                ? 'text-[#F4C2C2]'
                                                : 'text-black hover:underline hover:decoration-[#F4C2C2]'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Profile Icon at Bottom */}
                        <div className="mt-auto pt-8 border-t border-gray-200 flex justify-center">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleProfileClick();
                                }}
                                className="text-[#8B3E5D] flex flex-col items-center hover:text-[#6B2B45] focus:outline-none"
                            >
                                <FaUserCircle size={28} />
                                <span className="text-sm mt-1">
                                    {isLoggedIn ? 'Logout' : 'Login'}
                                </span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}  
:
In Navbar as u can see there's FaHeart Icon(wishlist) so i want a badge in top right of it showing total no. of products in wishlist of user. As there is good color contrast so for badge choose wisely must look good. 



##
🎨 #Suggestion: Product Card Polish

Once you're done with functionality, I can also help:

Add hover overlays, like “Quick View” or “View Details”.

Animate color change on hover.

Improve spacing & fonts for a more premium modest vibe.

Apply your brand color palette more cohesively.

Add badges like "Best Selling", "New", etc.


##
Pagination: If you expect many results, consider adding pagination to avoid overwhelming the user with too many products.

Search Debouncing: You might want to debounce the search query to avoid excessive requests to the backend as the user types. This can improve performance.

No Results Found: Be sure to handle cases where no products match the search query gracefully, like showing a friendly message or alternative suggestions.