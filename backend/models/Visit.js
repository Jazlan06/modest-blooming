// models/Visit.js
const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional for logged-in users
  sessionId: { type: String, required: true }, // for guests
  visitedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visit', visitSchema);