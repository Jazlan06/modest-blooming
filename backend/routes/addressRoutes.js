const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const {
  addAddress,
  getAddresses,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

const router = express.Router();

router.get('/', isAuthenticated, getAddresses);
router.post('/', isAuthenticated, addAddress);
router.delete('/:id', isAuthenticated, deleteAddress);
router.put('/:id/default', isAuthenticated, setDefaultAddress);

module.exports = router;
