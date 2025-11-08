// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  couponUsage: [
    {
      couponId: mongoose.Schema.Types.ObjectId,
      usageCount: Number
    }
  ],

  topProducts: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      totalQuantity: Number
    }
  ],

  // Track userId and the specific day they were active
  activeUsersToday: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      date: { type: Date, default: Date.now } // stores the day of activity
    }
  ],

  repeatedUsers: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      ordersCount: Number
    }
  ],

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);