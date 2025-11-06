const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            selectedVariant: { type: String },
            priceAtPurchase: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number },
    address: {
        locality: String,
        city: String,
        state: String,
        pincode: String,
        street: String,
        apartment: String
    },
    isHamper: { type: Boolean, default: false },
    couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    paymentInfo: {
        paymentId: { type: String },
        orderId: { type: String },
        signature: { type: String }
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);