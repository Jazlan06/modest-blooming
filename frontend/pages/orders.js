'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { FiTruck, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                setLoading(false);
                return;
            }

            try {
                const { data } = await axios.get(
                    'http://localhost:5000/api/orders/my',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        if (status === 'pending') return <FiClock className="text-yellow-500 animate-pulse" title="Pending" />;
        if (status === 'shipped') return <FiTruck className="text-blue-500" title="Shipped" />;
        if (status === 'completed') return <FiCheckCircle className="text-green-600" title="Completed" />;
        if (status === 'cancelled') return <FiXCircle className="text-red-500" title="Cancelled" />;
        return null;
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            shipped: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status]}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const getCardStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50';
            case 'shipped':
                return 'bg-white border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
            case 'completed':
                return 'bg-gradient-to-r from-green-100 to-green-200';
            case 'cancelled':
                return 'bg-gradient-to-r from-red-100 to-red-200';
            default:
                return 'bg-white';
        }
    };

    if (loading) return <p className="text-center mt-24 text-lg text-gray-600">Loading orders...</p>;

    if (!orders.length)
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <FiClock size={80} className="text-gray-300 mb-6 animate-pulse" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
                <p className="text-gray-500 text-center max-w-xs">
                    You haven't placed any orders yet. Browse products and place your first order!
                </p>
            </div>
        );

    return (
        <>
            <Head>
                <title>My Orders | Modest Blooming</title>
                <meta
                    name="description"
                    content="View and track your orders at Modest Blooming. Check order status, details, and history for your account."
                />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="container mx-auto p-4">
                {/* Top Bar */}
                <div className="flex items-center mb-8">
                    <button
                        className="mr-4 text-gray-700 hover:text-gray-900 transition"
                        onClick={() => router.back()}
                    >
                        <FiArrowLeft size={36} />
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Orders</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            layout
                            whileHover={{ scale: 1.05 }}
                            className={`p-6 rounded-2xl shadow-lg cursor-pointer transition-shadow flex flex-col justify-between ${getCardStyle(order.status)}`}
                            onClick={() => setSelectedOrder(order)}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold text-lg md:text-xl text-gray-800">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </h2>
                                <div className="text-2xl">{getStatusIcon(order.status)}</div>
                            </div>

                            <div className="mb-4 space-y-1">
                                <p className="text-gray-600 font-medium">Items: <span className="font-normal">{order.products.length}</span></p>
                                <p className="text-gray-600 font-medium">Total: <span className="font-normal">₹{order.totalAmount}</span></p>
                            </div>

                            <div className="flex justify-between items-center mt-auto">
                                <p className="text-gray-500 text-sm">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                                {getStatusBadge(order.status)}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {selectedOrder && (
                    <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                )}
            </div>
        </>
    );
}
OrdersPage.isPrivate = true;