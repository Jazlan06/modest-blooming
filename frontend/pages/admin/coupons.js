import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import withAdminAuth from '@/utils/withAdminAuth';

function CouponManager() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCoupons, setTotalCoupons] = useState(0);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minAmount: '',
        maxDiscount: '',
        expiresAt: '',
    });

    const itemsPerPage = 6;

    // 🧩 Fetch coupons (server-side pagination)
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const query = new URLSearchParams({
                page,
                limit: itemsPerPage,
                search,
                status: filter,
            }).toString();

            const res = await fetch(`http://localhost:5000/api/coupons?${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) throw new Error('Failed to fetch coupons');
            const data = await res.json();

            setCoupons(data.coupons || []);
            setTotalPages(data.pages || 1);
            setTotalCoupons(data.total || 0);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error fetching coupons');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when page/filter changes
    useEffect(() => {
        fetchCoupons();
    }, [page, filter]);

    // Debounce search
    useEffect(() => {
        const delay = setTimeout(() => fetchCoupons(), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handleChange = (e) => {
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    // Create or update coupon
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Unauthorized');

        const url = editing
            ? `http://localhost:5000/api/coupons/${editing._id}`
            : 'http://localhost:5000/api/coupons';
        const method = editing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save coupon');
            toast.success(editing ? 'Coupon updated!' : 'Coupon created!');
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minAmount: '',
                maxDiscount: '',
                expiresAt: '',
            });
            setEditing(null);
            fetchCoupons();
        } catch (err) {
            toast.error('Error saving coupon');
            console.error(err);
        }
    };

    const deleteCoupon = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return toast.error('Unauthorized');

            const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (err) {
            toast.error('Error deleting coupon');
            console.error(err);
        }
    };

    const handleEdit = (coupon) => {
        setEditing(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minAmount: coupon.minAmount || '',
            maxDiscount: coupon.maxDiscount || '',
            expiresAt: coupon.expiresAt?.split('T')[0],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Navbar />
            <Toaster position="top-right" />
            <div className="container mx-auto px-6 mt-[7rem] mb-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-4xl md:mt-[4rem] font-bold font-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        🎟️ Coupon Management
                    </h1>
                    <div className="flex gap-3 mt-7 md:mt-[4rem]">
                        {['all', 'active', 'expired'].map((type) => (
                            <motion.button
                                key={type}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setFilter(type);
                                    setPage(1);
                                }}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === type
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <input
                        type="text"
                        placeholder="🔍 Search coupons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-1/2 border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </motion.div>

                {/* FORM (create/edit) */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow-md mb-10 border-t-4 border-blue-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Coupon Code"
                            className="border p-3 rounded-md"
                            required
                        />
                        <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleChange}
                            className="border p-3 rounded-md"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                        <input
                            type="number"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleChange}
                            placeholder="Discount Value"
                            className="border p-3 rounded-md"
                            required
                        />
                        <input
                            type="number"
                            name="minAmount"
                            value={formData.minAmount}
                            onChange={handleChange}
                            placeholder="Min Order Amount"
                            className="border p-3 rounded-md"
                        />
                        <input
                            type="number"
                            name="maxDiscount"
                            value={formData.maxDiscount}
                            onChange={handleChange}
                            placeholder="Max Discount (if any)"
                            className="border p-3 rounded-md"
                        />
                        <input
                            type="date"
                            name="expiresAt"
                            value={formData.expiresAt}
                            onChange={handleChange}
                            className="border p-3 rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className={`px-6 py-3 rounded-lg text-white font-semibold ${editing
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {editing ? 'Update Coupon' : 'Create Coupon'}
                        </motion.button>
                    </div>
                </motion.form>

                {/* COUPON LIST */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    {loading ? (
                        <div className="text-center text-gray-600 py-10 animate-pulse">
                            Loading...
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No coupons found.
                        </div>
                    ) : (
                        <>
                            <AnimatePresence>
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    layout
                                >
                                    {coupons.map((c) => {
                                        const isExpired = new Date(c.expiresAt) < new Date();
                                        return (
                                            <motion.div
                                                key={c._id}
                                                className={`p-5 border rounded-xl shadow-sm transition-all ${isExpired
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 hover:shadow-md'
                                                    }`}
                                                whileHover={{ scale: 1.02 }}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                            >
                                                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                                    {c.code}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {c.discountType === 'percentage'
                                                        ? `${c.discountValue}% off`
                                                        : `₹${c.discountValue} off`}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    Min: ₹{c.minAmount || 0}{' '}
                                                    {c.maxDiscount && `| Max Discount: ₹${c.maxDiscount}`}
                                                </p>
                                                <p
                                                    className={`text-xs mt-2 font-medium ${isExpired ? 'text-red-500' : 'text-green-600'
                                                        }`}
                                                >
                                                    {isExpired
                                                        ? `Expired on ${new Date(
                                                            c.expiresAt
                                                        ).toLocaleDateString()}`
                                                        : `Expires on ${new Date(
                                                            c.expiresAt
                                                        ).toLocaleDateString()}`}
                                                </p>

                                                <div className="flex justify-end gap-3 mt-4">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEdit(c)}
                                                        className="text-yellow-600 hover:text-yellow-700 font-medium"
                                                    >
                                                        ✏️ Edit
                                                    </motion.button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deleteCoupon(c._id)}
                                                        className="text-red-600 hover:text-red-700 font-medium"
                                                    >
                                                        🗑️ Delete
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </AnimatePresence>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-10 gap-4 items-center">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="px-5 py-2 font-semibold rounded-lg shadow-md transition-all 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        ◀ Prev
                                    </motion.button>

                                    <span className="text-gray-700 font-medium">
                                        Page {page} of {totalPages} ({totalCoupons} coupons)
                                    </span>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        className="px-5 py-2 font-semibold rounded-lg shadow-md transition-all 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        Next ▶
                                    </motion.button>
                                </div>
                            )}

                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAdminAuth(CouponManager);