const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
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
            image: String, // cloudinary image/video
            price: Number,
            discountPrice: Number,
            weight: Number
        }
    ],
    media: [String], // all images (Cloudinary URLs)
    bestSelling: { type: Boolean, default: false },
    quantity: {
        type: Number,
        default: 0
    },
    inStock: { type: Boolean, default: true },
    weight: {
        type: Number,
        required: true,
        min: [0.01, 'Weight must be at least 0.01kg']
    },
    groupId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
