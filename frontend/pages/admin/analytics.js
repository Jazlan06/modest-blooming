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

export default function AdminAnalyticsDashboard() {
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
        } catch (err) {
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
        } catch (err) {
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
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">
                Loading analytics...
            </div>
        );

    // --- Chart Configurations ---
    const productChart = {
        labels: topProducts.map((p) => p.title),
        datasets: [
            {
                label: "Units Sold",
                data: topProducts.map((p) => p.totalQuantity),
                backgroundColor: "rgba(99, 102, 241, 0.6)",
                borderColor: "#6366F1",
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
                borderColor: "#16A34A",
                backgroundColor: "rgba(34,197,94,0.2)",
                fill: true,
            },
        ],
    };

    const couponChart = {
        labels: couponStats.map((c) => c.code),
        datasets: [
            {
                data: couponStats.map((c) => c.usageCount),
                backgroundColor: [
                    "#6366F1",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#14B8A6",
                ],
            },
        ],
    };

    return (
        <>
            <Navbar />
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 pt-[5rem] px-6 md:px-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center font-heading">
                    Admin Analytics Dashboard
                </h1>

                {/* === User Overview Cards === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                >
                    {[
                        {
                            icon: <FaUsers />,
                            title: "Total Users",
                            value: userStats.totalUsers,
                            color: "bg-indigo-500",
                        },
                        {
                            icon: <FaChartLine />,
                            title: "Active Users Today",
                            value: userStats.activeUsersToday,
                            color: "bg-green-500",
                        },
                        {
                            icon: <FaRedoAlt />,
                            title: "Repeat Customers",
                            value: userStats.repeatUsers,
                            color: "bg-yellow-500",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => handleCardClick(card.title)}
                            className={`rounded-xl shadow-md text-white p-6 flex flex-col items-center justify-center ${card.color} cursor-pointer`}
                        >
                            <div className="text-3xl mb-3">{card.icon}</div>
                            <div className="text-lg font-semibold">{card.title}</div>
                            <div className="text-3xl font-bold mt-1">{card.value}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* === Top Products & Sales Charts === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    {/* Top Selling Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                            <FaTags className="text-indigo-600" /> Top Selling Products
                        </h2>
                        <Bar data={productChart} />
                    </motion.div>

                    {/* Sales Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                            <FaChartLine className="text-green-600" /> Sales Revenue by Event
                        </h2>
                        <Line data={salesChart} />
                    </motion.div>
                </div>

                {/* === Coupon Stats === */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto"
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                        <FaTags className="text-pink-500" /> Coupon Usage Stats
                    </h2>
                    <div className="w-[60%] mx-auto">
                        <Doughnut data={couponChart} />
                    </div>
                </motion.div>

                {/* === Active Users Modal === */}
                {showActiveModal && (
                    <Modal
                        title="Active Users Today"
                        users={activeList}
                        pagination={activePagination}
                        onClose={() => setShowActiveModal(false)}
                        onPageChange={fetchActiveUsersList}
                    />
                )}

                {/* === Repeat Customers Modal === */}
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

function Modal({ title, users, pagination, onClose, onPageChange }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✖
                    </button>
                </div>

                <table className="w-full text-left border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="p-2 border">{u.name || "N/A"}</td>
                                <td className="p-2 border">{u.email}</td>
                                <td className="p-2 border">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => onPageChange(pagination.page + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}