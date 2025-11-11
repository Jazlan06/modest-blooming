const express = require('express');
const router = express.Router();
const { checkDeliveryAvailability } = require('../controllers/deliveryController');
const { calculateDeliveryCharge } = require("../helpers/calculateDeliveryCharge");
const { getAllZones, updateZoneRate, createZone, deleteZone } = require('../controllers/admin/deliveryRateController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

//Public
router.post('/check-zone', checkDeliveryAvailability);

router.post("/calculate", async (req, res) => {
    try {
        const { cartItems, address, isHamper } = req.body;
        if (!cartItems || !address) {
            return res.status(400).json({ message: "Cart items and address required" });
        }

        const { deliveryCharge, ratePerKg, totalWeight } = await calculateDeliveryCharge({
            cartItems,
            address,
            isHamper,
        });

        res.json({ success: true, deliveryCharge, ratePerKg, totalWeight });
    } catch (err) {
        console.error("Error calculating delivery charge:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

//Admin
// Get all zones
router.get('/admin/zones', isAuthenticated, isAdmin, getAllZones);
// Create one or multiple zones
router.post('/admin/zones', isAuthenticated, isAdmin, createZone);

// Update rate of a specific zone
router.put('/admin/zones/:id', isAuthenticated, isAdmin, updateZoneRate);
// Delete a zone
router.delete('/admin/zones/:id', isAuthenticated, isAdmin, deleteZone);

module.exports = router;