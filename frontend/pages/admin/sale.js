"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import withAdminAuth from '@/utils/withAdminAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SaleManagement() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "global",
        categories: "",
        discountType: "percentage",
        discountValue: "",
        startDate: "",
        endDate: "",
    });
    const [editingId, setEditingId] = useState(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/api/sales?page=${page}&limit=5&search=${search}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            setSales(data.sales);
            setTotalPages(data.pagination.pages);
        } catch (err) {
            toast.error("Failed to load sales");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSales();
    }, [page, search]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_URL}/api/sales/${editingId}`
                : `${API_URL}/api/sales`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    categories: form.categories.split(",").map((c) => c.trim()),
                    discountValue: Number(form.discountValue),
                }),
            });

            if (!res.ok) throw new Error("Failed to save sale");

            toast.success(`Sale ${editingId ? "updated" : "created"} successfully`);
            setForm({
                title: "",
                description: "",
                type: "global",
                categories: "",
                discountType: "percentage",
                discountValue: "",
                startDate: "",
                endDate: "",
            });
            setEditingId(null);
            fetchSales();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (sale) => {
        setForm({
            title: sale.title,
            description: sale.description || "",
            type: sale.type,
            categories: sale.categories.join(", "),
            discountType: sale.discountType,
            discountValue: sale.discountValue,
            startDate: sale.startDate.slice(0, 10),
            endDate: sale.endDate.slice(0, 10),
        });
        setEditingId(sale._id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this sale?")) return;
        try {
            await fetch(`${API_URL}/api/sales/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Sale deleted");
            fetchSales();
        } catch {
            toast.error("Failed to delete sale");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto py-12 px-6">
                <h1 className="text-4xl font-bold text-center mb-10 mt-[5rem] font-heading text-gray-800">
                    Sale Management
                </h1>

                {/* Form */}
                <motion.form
                    layout
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-xl p-8 mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold font-display mb-6 text-gray-700">
                        {editingId ? "Edit Sale" : "Add New Sale"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="global">Global</option>
                            <option value="category">Category</option>
                            <option value="festival">Festival</option>
                            <option value="seasonal">Seasonal</option>
                        </select>
                        <input
                            type="text"
                            name="categories"
                            placeholder="Categories (comma-separated)"
                            value={form.categories}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <select
                            name="discountType"
                            value={form.discountType}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input
                            type="number"
                            name="discountValue"
                            placeholder="Discount Value"
                            value={form.discountValue}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-6 px-6 py-3 font-body bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-xl"
                    >
                        {editingId ? "Update Sale" : "Create Sale"}
                    </button>
                </motion.form>

                <div className="mb-6 flex justify-end">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full md:w-1/3"
                    />
                </div>

                {/* Sales Table */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {loading ? (
                            <motion.div
                                key="loading"
                                className="text-center py-8 text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Loading...
                            </motion.div>
                        ) : sales.length === 0 ? (
                            <motion.div
                                key="empty"
                                className="text-center py-8 text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                No sales found
                            </motion.div>
                        ) : (
                            sales.map((sale) => (
                                <motion.div
                                    key={sale._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:justify-between md:items-center hover:shadow-xl transition"
                                >
                                    <div className="flex-1 space-y-1">
                                        <p className="text-lg font-semibold text-gray-800 font-body mb-3">{sale.title}</p>

                                        {/* Type Badge */}
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-semibold font-body ${sale.type === "global"
                                                ? "bg-indigo-100 text-indigo-800"
                                                : sale.type === "category"
                                                    ? "bg-green-100 text-green-800"
                                                    : sale.type === "festival"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-pink-100 text-pink-800"
                                                }`}
                                        >
                                            {sale.type}
                                        </span>

                                        <p className="text-gray-600 font-body my-5">
                                            {sale.discountType === "percentage"
                                                ? `${sale.discountValue}%`
                                                : `₹${sale.discountValue}`}{" "}
                                            discount
                                        </p>
                                        <p className="text-gray-400 text-sm font-body ">
                                            {new Date(sale.startDate).toLocaleDateString()} -{" "}
                                            {new Date(sale.endDate).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex space-x-3">
                                        <button
                                            onClick={() => handleEdit(sale)}
                                            className="px-4 py-2 font-body bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sale._id)}
                                            className="px-4 py-2 font-body bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded-md transition ${page === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                    >
                        Next
                    </button>
                </div>

            </div>
        </div>
    );
}
export default withAdminAuth(SaleManagement);