const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // Array of image URLs (Cloudinary links)
  price: { type: Number, required: true },
  category: { type: String, required: true },
  colors: [{ type: String }],
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  bestSelling: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
