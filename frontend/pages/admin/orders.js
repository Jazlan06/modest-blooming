"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrderManagementPage() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [filters, setFilters] = useState({
        status: "",
        customer: "",
        dateFrom: formatDate(thirtyDaysAgo),
        dateTo: formatDate(today),
    });
    const [debouncedCustomer, setDebouncedCustomer] = useState(filters.customer);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 5;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Debounce for customer filter
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedCustomer(filters.customer);
        }, 400);
        return () => clearTimeout(handler);
    }, [filters.customer]);

    // Fetch orders
    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: ordersPerPage,
                status: filters.status,
                customer: debouncedCustomer,
            });

            if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
            if (filters.dateTo) params.append("dateTo", filters.dateTo);

            const res = await fetch(`${API_URL}/api/orders?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch orders");

            const data = await res.json();
            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || 1);
        } catch (err) {
            toast.error(err.message || "Failed to fetch orders");
        }
        setLoading(false);
    };

    // Fetch orders whenever filters, page, or debouncedCustomer changes
    useEffect(() => {
        setCurrentPage(1);
        fetchOrders(1);
    }, [filters.status, filters.dateFrom, filters.dateTo, debouncedCustomer]);

    useEffect(() => {
        if (currentPage !== 1) {
            fetchOrders(currentPage);
        }
    }, [currentPage]);

    const handleStatusUpdate = async (orderId) => {
        if (!statusUpdate[orderId]) return toast.error("Select a status first");
        setUpdatingId(orderId);
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: statusUpdate[orderId] }),
            });

            if (!res.ok) throw new Error("Failed to update status");
            toast.success("Order status updated");
            fetchOrders(currentPage);
        } catch (err) {
            toast.error(err.message);
        }
        setUpdatingId(null);
    };

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        shipped: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    const resetFilters = () => {
        setFilters({
            status: "",
            customer: "",
            dateFrom: formatDate(thirtyDaysAgo),
            dateTo: formatDate(today),
        });
        setCurrentPage(1);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <Toaster position="top-right" />
                <div className="max-w-7xl mx-auto py-12 px-6">
                    <h1 className="text-4xl mt-[4rem] font-bold font-heading text-center mb-10 text-gray-800">
                        Order Management
                    </h1>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search by customer name or email"
                            value={filters.customer}
                            onChange={(e) => setFilters((prev) => ({ ...prev, customer: e.target.value }))}
                            className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold transition"
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-6">
                        <AnimatePresence>
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-10 text-gray-500"
                                >
                                    Loading orders...
                                </motion.div>
                            ) : orders.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-10 text-gray-400"
                                >
                                    No orders found
                                </motion.div>
                            ) : (
                                orders.map((order) => {
                                    const isExpanded = expandedId === order._id;
                                    return (
                                        <motion.div
                                            key={order._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition"
                                        >
                                            {/* Header */}
                                            <div
                                                className="flex flex-col md:flex-row justify-between items-start md:items-center"
                                                onClick={() => setExpandedId(isExpanded ? null : order._id)}
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        Order ID: {order._id.slice(-6).toUpperCase()}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Customer: {order.user?.name || "Unknown"} ({order.user?.email || "Unknown"})
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Total: ₹{order.totalAmount.toFixed(2)} | Delivery: ₹{order.deliveryCharge?.toFixed(2) || 0}
                                                    </p>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}
                                                    >
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-3">
                                                    <select
                                                        value={statusUpdate[order._id] || ""}
                                                        onChange={(e) =>
                                                            setStatusUpdate((prev) => ({ ...prev, [order._id]: e.target.value }))
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                                    >
                                                        <option value="">Change status...</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusUpdate(order._id);
                                                        }}
                                                        disabled={updatingId === order._id}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-xl disabled:opacity-50"
                                                    >
                                                        {updatingId === order._id ? "Updating..." : "Update"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        key="details"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-4 border-t border-gray-200 pt-4 space-y-2 text-gray-700"
                                                    >
                                                        <div>
                                                            <h3 className="font-semibold mb-1">Products:</h3>
                                                            {order.products.map((p, i) => (
                                                                <div key={i} className="flex justify-between py-1">
                                                                    <span>
                                                                        {p.product?.name || "Product"} x {p.quantity} ({p.selectedVariant || "Default"})
                                                                    </span>
                                                                    <span>₹{p.priceAtPurchase ? p.priceAtPurchase.toFixed(2) : 0}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold mb-1">Shipping Address:</h3>
                                                            <p>
                                                                {order.address?.street || ""}, {order.address?.apartment || ""}, {order.address?.locality || ""}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold mb-1">Payment Info:</h3>
                                                            <p>Payment ID: {order.paymentInfo?.paymentId || "-"}</p>
                                                            <p>Order ID: {order.paymentInfo?.orderId || "-"}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold mb-1">Timestamps:</h3>
                                                            <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
                                                            <p>Last Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-3">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}