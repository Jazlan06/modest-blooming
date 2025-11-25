"use client";
import { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { FaChartLine, FaTags, FaUsers, FaRedoAlt } from "react-icons/fa";
import withAdminAuth from '@/utils/withAdminAuth';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function AdminAnalyticsDashboard() {
    const [topProducts, setTopProducts] = useState([]);
    const [salesReport, setSalesReport] = useState([]);
    const [couponStats, setCouponStats] = useState([]);
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        activeUsersToday: 0,
        repeatUsers: 0,
    });
    const [showActiveModal, setShowActiveModal] = useState(false);
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [activeList, setActiveList] = useState([]);
    const [repeatList, setRepeatList] = useState([]);
    const [activePagination, setActivePagination] = useState({ page: 1, totalPages: 1 });
    const [repeatPagination, setRepeatPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const fetchAllAnalytics = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [
                productsRes,
                salesRes,
                couponRes,
                usersRes,
                activeUsersRes,
                repeatedUsersRes,
            ] = await Promise.all([
                fetch(`${API_URL}/api/analytics/top-products`, { headers }),
                fetch(`${API_URL}/api/analytics/sales-report`, { headers }),
                fetch(`${API_URL}/api/analytics/coupon-usage`, { headers }),
                fetch(`${API_URL}/api/analytics/user-registrations`, { headers }),
                fetch(`${API_URL}/api/analytics/active-users-today`, { headers }),
                fetch(`${API_URL}/api/analytics/repeated-users`, { headers }),
            ]);

            const [
                topProdData,
                salesData,
                couponData,
                totalUsers,
                activeToday,
                repeatedUsers,
            ] = await Promise.all([
                productsRes.json(),
                salesRes.json(),
                couponRes.json(),
                usersRes.json(),
                activeUsersRes.json(),
                repeatedUsersRes.json(),
            ]);

            if (topProdData.success) setTopProducts(topProdData.data);
            if (salesData.success) setSalesReport(salesData.data);
            if (couponData.success) setCouponStats(couponData.data);

            setUserStats({
                totalUsers: totalUsers?.data?.totalUsers || 0,
                activeUsersToday: activeToday?.data?.activeUsersCount || 0,
                repeatUsers: repeatedUsers?.data?.length || 0,
            });
        } catch (err) {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveUsersList = async (page = 1) => {
        try {
            const res = await fetch(
                `${API_URL}/api/analytics/active-users-list?page=${page}&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setActiveList(data.data);
                setActivePagination(data.pagination || { page: 1, totalPages: 1 });
            }
        } catch {
            toast.error("Failed to load active users list");
        }
    };

    const fetchRepeatUsersList = async (page = 1) => {
        try {
            const res = await fetch(
                `${API_URL}/api/analytics/repeated-users-list?page=${page}&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setRepeatList(data.data);
                setRepeatPagination(data.pagination || { page: 1, totalPages: 1 });
            }
        } catch {
            toast.error("Failed to load repeat users list");
        }
    };

    const handleCardClick = async (cardTitle) => {
        if (cardTitle === "Active Users Today") {
            await fetchActiveUsersList(1);
            setShowActiveModal(true);
        }
        if (cardTitle === "Repeat Customers") {
            await fetchRepeatUsersList(1);
            setShowRepeatModal(true);
        }
    };

    useEffect(() => {
        fetchAllAnalytics();
    }, []);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen text-lg text-gray-500">
                Loading analytics...
            </div>
        );

    // Chart Data
    const productChart = {
        labels: topProducts.map((p) => p.title),
        datasets: [
            {
                label: "Units Sold",
                data: topProducts.map((p) => p.totalQuantity),
                backgroundColor: "rgba(236, 72, 153, 0.5)",
                borderColor: "#ec4899",
                borderWidth: 2,
            },
        ],
    };

    const salesChart = {
        labels: salesReport.map((s) => s.title),
        datasets: [
            {
                label: "Revenue (₹)",
                data: salesReport.map((s) => s.totalRevenue || 0),
                borderColor: "#22c55e",
                backgroundColor: "rgba(34,197,94,0.2)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const couponChart = {
        labels: couponStats.map((c) => c.code),
        datasets: [
            {
                data: couponStats.map((c) => c.usageCount),
                backgroundColor: [
                    "#ec4899",
                    "#3b82f6",
                    "#f97316",
                    "#22c55e",
                    "#8b5cf6",
                    "#14b8a6",
                ],
            },
        ],
    };

    return (
        <>
            <Navbar />
            <Toaster position="top-right" />
            <div className="min-h-screen mt-[4rem] bg-gradient-to-b from-[#fff6f7] to-[#fce7f3] pt-[5rem] px-6 md:px-12">
                {/* Page Header */}
                <div className="text-center mb-14">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-red-400 bg-clip-text text-transparent tracking-tight">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl mx-auto">
                        Gain insights into your store’s performance — users, products, and sales all in one glance.
                    </p>
                    <div className="w-20 h-[3px] bg-gradient-to-r from-pink-400 to-rose-500 mx-auto mt-6 rounded-full"></div>
                </div>

                {/* === Stat Cards === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    {[
                        {
                            icon: <FaUsers />,
                            title: "Total Users",
                            value: userStats.totalUsers,
                            color: "from-pink-400 to-rose-500",
                        },
                        {
                            icon: <FaChartLine />,
                            title: "Active Users Today",
                            value: userStats.activeUsersToday,
                            color: "from-green-400 to-emerald-500",
                        },
                        {
                            icon: <FaRedoAlt />,
                            title: "Repeat Customers",
                            value: userStats.repeatUsers,
                            color: "from-amber-400 to-orange-500",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleCardClick(card.title)}
                            className={`relative p-8 text-white rounded-2xl cursor-pointer bg-gradient-to-br ${card.color} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-all"></div>
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                                <div className="text-4xl mb-3 drop-shadow-sm">{card.icon}</div>
                                <h3 className="text-lg font-semibold">{card.title}</h3>
                                <p className="text-3xl font-bold mt-2">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* === Charts Section === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all border border-white/50"
                    >
                        <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
                            <FaTags className="text-pink-500" /> Top Selling Products
                        </h2>
                        <Bar data={productChart} />
                    </motion.div>

                    {/* Sales Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all border border-white/50"
                    >
                        <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
                            <FaChartLine className="text-green-500" /> Sales Revenue by Event
                        </h2>
                        <Line data={salesChart} />
                    </motion.div>
                </div>

                {/* === Coupon Usage === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl p-8 max-w-3xl mx-auto transition-all border border-white/50"
                >
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                        <FaTags className="text-rose-500" /> Coupon Usage Stats
                    </h2>
                    <div className="w-[70%] mx-auto">
                        <Doughnut data={couponChart} />
                    </div>
                </motion.div>

                {/* === Modals === */}
                {showActiveModal && (
                    <Modal
                        title="Active Users Today"
                        users={activeList}
                        pagination={activePagination}
                        onClose={() => setShowActiveModal(false)}
                        onPageChange={fetchActiveUsersList}
                    />
                )}
                {showRepeatModal && (
                    <Modal
                        title="Repeat Customers"
                        users={repeatList}
                        pagination={repeatPagination}
                        onClose={() => setShowRepeatModal(false)}
                        onPageChange={fetchRepeatUsersList}
                    />
                )}
            </div>
        </>
    );
}

// --- Enhanced Modal ---
function Modal({ title, users, pagination, onClose, onPageChange }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-3xl"
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border border-gray-200 text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition">
                                    <td className="p-2 border">{u.name || "N/A"}</td>
                                    <td className="p-2 border">{u.email}</td>
                                    <td className="p-2 border">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-5">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => onPageChange(pagination.page + 1)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
export default withAdminAuth(AdminAnalyticsDashboard);