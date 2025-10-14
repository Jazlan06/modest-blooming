const express = require('express');
const { checkDeliveryAvailability } = require('../controllers/deliveryController');
const router = express.Router();

router.post('/check-zone', checkDeliveryAvailability);

module.exports = router;
