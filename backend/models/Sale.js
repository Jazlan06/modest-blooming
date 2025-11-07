const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    type: {
        type: String,
        enum: ['global', 'category', 'festival', 'seasonal'],
        required: true
    },

    categories: [
        {
            type: String
        }
    ],

    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },

    discountValue: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sale', saleSchema);