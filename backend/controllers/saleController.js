const Sale = require('../models/Sale');

// Create Sale
const createSale = async (req, res) => {
    try {
        const sale = await Sale.create(req.body);
        res.status(201).json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Sale
const updateSale = async (req, res) => {
    try {
        const updated = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Sale not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Sale
const deleteSale = async (req, res) => {
    try {
        const deleted = await Sale.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Sale not found' });
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get All Sales with pagination & search
const getAllSales = async (req, res) => {
    try {
        let { page = 1, limit = 5, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const total = await Sale.countDocuments(query);
        const sales = await Sale.find(query)
            .sort({ startDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            sales,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Active Sales
const getActiveSales = async (req, res) => {
    try {
        const now = new Date();
        const active = await Sale.find({
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        res.json(active);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createSale,
    updateSale,
    deleteSale,
    getAllSales,
    getActiveSales
};