const Coupon = require('../models/Coupon');
const User = require('../models/User');

// Admin: Create
const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Update
const updateCoupon = async (req, res) => {
    try {
        const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Coupon not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Delete
const deleteCoupon = async (req, res) => {
    try {
        const deleted = await Coupon.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Public: Get All (optional)
// Admin: Get all (paginated, searchable, filterable)
const getAllCoupons = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = 'all', // "active" | "expired" | "all"
        } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.code = { $regex: search.trim(), $options: 'i' };
        }

        // Active / Expired filter
        const now = new Date();
        if (status === 'active') {
            query.expiresAt = { $gte: now };
        } else if (status === 'expired') {
            query.expiresAt = { $lt: now };
        }

        // Pagination numbers
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch paginated results
        const [coupons, total] = await Promise.all([
            Coupon.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Coupon.countDocuments(query),
        ]);

        res.json({
            coupons,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ message: err.message });
    }
};

// User: Apply Coupon
const applyCoupon = async (req, res) => {
    const { code, totalAmount } = req.body;
    const userId = req.user.userId;

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon || coupon.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Coupon is invalid or expired' });
        }

        if (coupon.usedBy.includes(userId)) {
            return res.status(400).json({ message: 'You have already used this coupon' });
        }

        if (coupon.minAmount && totalAmount < coupon.minAmount) {
            return res.status(400).json({ message: `Minimum amount of ₹${coupon.minAmount} required` });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (totalAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
            discount = coupon.discountValue;
        }

        // Optionally mark used (can also do this only after order placed)
        // coupon.usedBy.push(userId);
        // await coupon.save();

        res.json({
            message: 'Coupon applied',
            discount,
            finalAmount: totalAmount - discount
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
    applyCoupon
};

