const User = require('../models/User');
const Product = require('../models/Product');

// Add to Cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedColor } = req.body;
        const user = await User.findById(req.user.userId);

        const existingIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (existingIndex > -1) {
            user.cart[existingIndex].quantity = quantity;
        } else {
            user.cart.push({
                product: productId,
                quantity,
                selectedColor: selectedColor || { colorName: null, colorCode: null }
            });
        }
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        await user.populate("cart.product");
        res.json({ cart: user.cart, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.userId);

        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();
        await user.populate("cart.product");
        res.json({ cart: user.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
        }

        await user.save();
        res.json({ wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.userId);

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Cart & Wishlist
const getUserCartWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('cart.product')
            .populate('wishlist');

        res.json({
            cart: user.cart,
            wishlist: user.wishlist
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        user.cart = []; // empty the cart
        await user.save();

        res.json({ cart: [] }); // return empty cart
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    getUserCartWishlist,
    clearCart
};