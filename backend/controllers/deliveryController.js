// controllers/deliveryController.js
const { getZoneRate } = require('../helpers/calculateDeliveryCharge');

exports.checkDeliveryAvailability = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.city || !address.state) {
      return res.status(400).json({ success: false, message: 'Incomplete address' });
    }

    const rate = await getZoneRate(address);
    const isServiceable = rate !== 100;

    res.json({
      success: true,
      isServiceable,
      ratePerKg: rate,
      message: isServiceable ? 'Delivery available' : 'Delivery via DTDC only'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
