const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            },
            selectedColor: {
                colorName: {
                    type: String,
                    default: null
                },
                colorCode: {
                    type: String,
                    default: null
                }
            }
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    addresses: [
        {
            label: {
                type: String,
                enum: ['Home', 'Office', 'Other'],
                default: 'Home'
            },
            fullName: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true,
                match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
            },
            street: String,
            apartment: String,
            locality: String,
            city: String,
            state: String,
            pincode: String,
            isDefault: {
                type: Boolean,
                default: false
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
