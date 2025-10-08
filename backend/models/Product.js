const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: String, required: true },
    tags: [String], // for filters
    colors: [
        {
            colorName: String,
            colorCode: String,
            image: String, // cloudinary image
        }
    ],
    images: [String], // all images (Cloudinary URLs)
    isBestSeller: { type: Boolean, default: false },
    stock: {
        type: Number,
        default: 0
    },
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
