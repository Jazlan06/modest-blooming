const express = require('express');
const {
  getAllZones,
  updateZoneRate,
  createZone,
  deleteZone
} = require('../../controllers/admin/deliveryRateController');
const { isAuthenticated, isAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/', getAllZones);
router.post('/', createZone);
router.put('/:id', updateZoneRate);
router.delete('/:id', deleteZone);

module.exports = router;