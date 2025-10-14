const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  zone: Number,
  name: String,
  keywords: [String],
  rate: Number
});

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);