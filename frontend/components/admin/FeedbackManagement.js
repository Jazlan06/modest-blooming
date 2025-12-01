import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaTrashAlt, FaStar } from 'react-icons/fa';
import withAdminAuth from '@/utils/withAdminAuth';
import Navbar from '@/components/Navbar';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [zoomImage, setZoomImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', rating: '' });

    // Fetch all feedbacks
    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFeedbacks(res.data);
        } catch (err) {
            toast.error('Failed to load feedbacks');
            console.error(err);
        }
    };

    // Fetch rating analytics
    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/analytics/summary`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
        fetchAnalytics();
    }, []);

    // Delete feedback
    const deleteFeedback = async (id) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Feedback deleted');
            setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
        } catch (err) {
            toast.error('Failed to delete feedback');
            console.error(err);
        }
    };

    // Apply filters
    const filteredFeedbacks = feedbacks.filter((fb) => {
        const matchSearch =
            (fb.product?.title?.toLowerCase() || fb.product?.name?.toLowerCase() || '')
                .includes(filter.search.toLowerCase());
        const matchRating = filter.rating ? fb.rating === parseInt(filter.rating) : true;
        return matchSearch && matchRating;
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-12 mt-[6rem]">
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-800 mb-8 text-center">
                    Feedback Management
                </h1>

                {/* Analytics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-lg rounded-2xl p-6 mb-10"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                        Rating Analytics
                    </h2>
                    {loading ? (
                        <p className="text-gray-500 animate-pulse">Loading analytics...</p>
                    ) : (
                        <div className="grid grid-cols-5 gap-3 text-center">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex flex-col items-center">
                                    <span className="text-lg font-medium text-gray-700 flex items-center gap-1">
                                        {star} <FaStar className="text-yellow-400" />
                                    </span>
                                    <div className="w-8 bg-gray-200 h-24 rounded-full overflow-hidden">
                                        <div
                                            className="bg-yellow-400 w-full rounded-b-full"
                                            style={{
                                                height: `${(analytics[star] || 0) * 8}px`,
                                                minHeight: '6px',
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-gray-500 text-sm mt-1">
                                        {analytics[star] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:ring-2 focus:ring-yellow-400"
                    />
                    <select
                        value={filter.rating}
                        onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                                {r} Stars
                            </option>
                        ))}
                    </select>
                </div>

                {/* Feedback Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold">Product</th>
                                    <th className="py-3 px-4 text-left font-semibold">User</th>
                                    <th className="py-3 px-4 text-center font-semibold">Rating</th>
                                    <th className="py-3 px-4 text-left font-semibold">Message</th>
                                    <th className="py-3 px-4 text-center font-semibold">Media</th>
                                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedbacks.length > 0 ? (
                                    filteredFeedbacks.map((fb) => (
                                        <motion.tr
                                            key={fb._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">{fb.product?.title || fb.product?.name || '—'}</td>
                                            <td className="py-3 px-4">
                                                {fb.user?.name}
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {fb.user?.email}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-yellow-500">
                                                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 max-w-[300px] truncate">
                                                {fb.message}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {fb.media?.length > 0 ? (
                                                    <div className="flex justify-center gap-2">
                                                        {fb.media.map((url, i) => (
                                                            <img
                                                                key={i}
                                                                src={url}
                                                                alt="media"
                                                                onClick={() => setZoomImage(url)}
                                                                className="w-12 h-12 rounded-lg object-cover border cursor-pointer hover:scale-105 transition-transform"
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}

                                                {/* Zoom Modal */}
                                                {zoomImage && (
                                                    <div
                                                        onClick={() => setZoomImage(null)}
                                                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-zoom-out"
                                                    >
                                                        <img
                                                            src={zoomImage}
                                                            alt="zoomed"
                                                            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg transition-transform scale-100"
                                                        />
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => deleteFeedback(fb._id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-gray-500">
                                            No feedbacks found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withAdminAuth(FeedbackManagement);