const User = require('../models/User');

// Add Address
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const newAddress = req.body;

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!newAddress.fullName || !newAddress.phone || !phoneRegex.test(newAddress.phone)) {
            return res.status(400).json({ message: 'Please enter valid Full Name and Phone Number' });
        }

        if (newAddress.isDefault) {
            user.addresses.forEach(addr => (addr.isDefault = false));
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({ message: 'Address added', addresses: user.addresses });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Addresses
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Address deleted', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Set Default Address
exports.setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const { id } = req.params;

        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === id;
        });

        await user.save();
        res.json({ message: 'Default address updated', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};