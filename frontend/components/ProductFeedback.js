import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
//working
const Modal = ({ isOpen, onClose, title, message, mediaUrl, isVideo }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-6 max-w-full max-h-full overflow-auto"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white text-2xl font-bold"
                >
                    &times;
                </button>

                {mediaUrl ? (
                    isVideo ? (
                        <video controls className="max-w-full max-h-[80vh] rounded-xl">
                            <source src={mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img src={mediaUrl} alt="media" className="max-w-full max-h-[80vh] rounded-xl" />
                    )
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{title}</h2>
                        <p className="text-gray-700">{message}</p>
                    </>
                )}
            </motion.div>
        </div>
    );
};

const ProductFeedback = ({ productId, userId }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [zoomMedia, setZoomMedia] = useState({ url: '', isVideo: false, open: false });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const [hasReviewed, setHasReviewed] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/stats/product/${productId}`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/product/${productId}`);
            setFeedbacks(res.data);
            // Check if current user has already reviewed
            const alreadyReviewed = res.data.some(fb => fb.user._id === userId);
            setHasReviewed(alreadyReviewed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchFeedbacks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (hasReviewed) return toast.error('You have already reviewed this product.');
        if (!rating) return toast.error('Please provide a rating');

        const formData = new FormData();
        formData.append('productId', productId);
        const completedOrderId = await fetchCompletedOrderIdForProduct(productId);
        if (!completedOrderId) {
            return toast.error('You cannot review this product because you have no completed order.');
        }
        formData.append('orderId', completedOrderId);
        formData.append('message', message);
        formData.append('rating', rating);
        mediaFiles.forEach(file => formData.append('media', file));

        try {
            const token = localStorage.getItem("token");
            setSubmitting(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                'Authorization': `Bearer ${token}`
            });

            if (res.data.success) {
                setModal({
                    isOpen: true,
                    title: 'Thank you!',
                    message: 'Your review has been submitted successfully.'
                });
            }

            setMessage('');
            setRating(0);
            setMediaFiles([]);
            fetchFeedbacks();
            fetchStats();
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setModal({
                    isOpen: true,
                    title: 'Oops!',
                    message: 'You cannot review this product because you have no successful orders or are not logged in.'
                });
            } else if (err.response?.data?.code === 'NO_ORDER') {
                setModal({
                    isOpen: true,
                    title: 'Oops!',
                    message: 'You cannot review this product because you have no successful orders.'
                });
            } else {
                toast.error(err.response?.data?.message || 'Failed to submit feedback');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const fetchCompletedOrderIdForProduct = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/completed`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const completedOrders = res.data; // array of orders
            if (!Array.isArray(completedOrders)) return null;

            // Find the first order that has this product
            const order = completedOrders.find(o =>
                o.products.some(p => p.product._id === productId)
            );

            return order?._id || null;
        } catch (err) {
            console.error('Failed to fetch completed orders:', err);
            return null;
        }
    };

    return (
        <div className="mt-12 bg-white shadow-2xl rounded-3xl p-10 max-w-4xl mx-auto">
            {/* Modal */}
            <AnimatePresence>
                {modal.isOpen && (
                    <Modal
                        isOpen={modal.isOpen}
                        onClose={() => setModal({ ...modal, isOpen: false })}
                        title={modal.title}
                        message={modal.message}
                    />
                )}
            </AnimatePresence>

            <h2 className="text-3xl md:text-4xl font-semibold font-heading mb-8 text-gray-900 tracking-wide text-center">
                Customer Reviews
            </h2>

            {/* Stats */}
            <motion.div
                className="flex flex-col sm:flex-row items-center sm:justify-start mb-10 space-y-4 sm:space-y-0 sm:space-x-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-baseline space-x-2">
                    <span className="text-5xl md:text-6xl font-semibold font-body text-yellow-500">{stats.avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-lg md:text-xl font-body">/5</span>
                </div>
                <div className="text-gray-600 text-lg md:text-xl font-body">{stats.totalReviews} reviews</div>
            </motion.div>

            {/* Feedback List */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto mb-10">
                {loading ? (
                    <p className="text-gray-400 text-center animate-pulse">Loading reviews...</p>
                ) : feedbacks.length === 0 ? (
                    <p className="text-gray-400 text-center font-serif">No reviews yet. Be the first to review!</p>
                ) : (
                    <AnimatePresence>
                        {feedbacks.map(fb => {
                            const isCurrentUser = fb.user._id === userId;
                            return (
                                <motion.div
                                    key={fb._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`border p-5 rounded-2xl hover:shadow-xl transition-all ${isCurrentUser ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold font-body text-gray-800 text-lg md:text-xl">
                                            {fb.user.name}{isCurrentUser ? ' (You)' : ''}
                                        </span>
                                        <span className="text-yellow-500 text-2xl md:text-3xl">
                                            {'★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating)}
                                        </span>
                                    </div>

                                    {fb.message && <p className="text-gray-700 mb-3 font-serif text-md md:text-lg leading-relaxed">{fb.message}</p>}

                                    {fb.media && fb.media.length > 0 && (
                                        <div className="flex space-x-3 overflow-x-auto py-1">
                                            {fb.media.map((url, idx) => (
                                                <motion.img
                                                    key={idx}
                                                    src={url}
                                                    alt="feedback media"
                                                    className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-xl border hover:scale-105 transition-transform shadow-sm cursor-pointer"
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setZoomMedia({ url, isVideo: url.endsWith('.mp4'), open: true })}
                                                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                        {zoomMedia.open && (
                            <Modal
                                isOpen={zoomMedia.open}
                                onClose={() => setZoomMedia({ ...zoomMedia, open: false })}
                                mediaUrl={zoomMedia.url}
                                isVideo={zoomMedia.isVideo}
                            />
                        )}
                    </AnimatePresence>
                )}
            </div>


            {/* Submit Feedback */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-semibold font-heading mb-5 text-gray-900 tracking-wide">Write a Review</h3>
                {hasReviewed ? (
                    <p className="text-gray-500 font-medium mb-5 font-serif">You have already submitted a review for this product.</p>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Rating */}
                    <div>
                        <label className="block mb-2 text-[1.2rem] font-medium font-body text-gray-800">Rating</label>
                        <div className="flex space-x-3 text-3xl md:text-4xl">
                            {[1, 2, 3, 4, 5].map(star => (
                                <motion.button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    whileHover={{ scale: 1.3 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={hasReviewed}
                                    className={`transition-transform transform ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} disabled:cursor-not-allowed`}
                                >
                                    ★
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block mb-2 font-medium font-body text-[1.2rem] text-gray-800">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 text-lg transition hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Write your review..."
                            rows={5}
                            disabled={hasReviewed}
                        />
                    </div>

                    {/* Media */}
                    <div>
                        <label className="block mb-2 font-medium font-body text-[1.2rem] text-gray-800">Media (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setMediaFiles([...e.target.files])}
                            className="block text-gray-700"
                            disabled={hasReviewed}
                        />
                    </div>

                    {/* Submit Button */}
                    {!hasReviewed && (
                        <motion.button
                            type="submit"
                            disabled={submitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-yellow-500 text-white font-body text-[1.1rem] px-10 py-3 rounded-2xl hover:bg-yellow-400 transition transform disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </motion.button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProductFeedback;