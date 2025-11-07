const express = require('express');
const router = express.Router();
const { checkDeliveryAvailability } = require('../controllers/deliveryController');
const { getAllZones, updateZoneRate, createZone, deleteZone } = require('../controllers/admin/deliveryRateController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

//Public
router.post('/check-zone', checkDeliveryAvailability);

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