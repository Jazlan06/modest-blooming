"use client";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [removedHearts, setRemovedHearts] = useState([]);
    const { fetchWishlist: refreshGlobalWishlist } = useWishlist();

    const router = useRouter();
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Fetch wishlist
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/user/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                const wishlistItems = data.wishlist || [];
                setWishlist(wishlistItems);
                const uniqueCategories = [
                    ...new Set(wishlistItems.map((item) => item.category).filter(Boolean)),
                ];
                setCategories(["All", ...uniqueCategories]);
            } else {
                toast.error("Failed to fetch wishlist");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Remove from wishlist + heart animation
    const removeFromWishlist = async (productId, e) => {
        e.stopPropagation();

        // spawn a floating heart animation
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart = {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top,
        };
        setRemovedHearts((prev) => [...prev, newHeart]);

        try {
            const res = await fetch(`${API_URL}/api/user/wishlist/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setWishlist((prev) => prev.filter((item) => item._id !== productId));
                refreshGlobalWishlist();
                toast.success("Removed from wishlist");
            } else toast.error("Failed to remove");
        } catch {
            toast.error("Something went wrong");
        }

        // remove heart after animation
        setTimeout(
            () =>
                setRemovedHearts((prev) =>
                    prev.filter((heart) => heart.id !== newHeart.id)
                ),
            1500
        );
    };

    const moveToCart = async (productId, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${API_URL}/api/user/cart/${productId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            if (res.ok) {
                setWishlist((prev) => prev.filter((item) => item._id !== productId));
                refreshGlobalWishlist();
                toast.success("Moved to cart");
            } else toast.error("Failed to move to cart");
        } catch {
            toast.error("Something went wrong");
        }
    };

    const filteredWishlist =
        activeCategory === "All"
            ? wishlist
            : wishlist.filter((item) => item.category === activeCategory);

    useEffect(() => {
        fetchWishlist();
    }, []);

    useEffect(() => {
        const uniqueCategories = [
            ...new Set(wishlist.map((item) => item.category).filter(Boolean)),
        ];
        setCategories(["All", ...uniqueCategories]);

        if (!["All", ...uniqueCategories].includes(activeCategory)) {
            setActiveCategory("All");
        }
    }, [wishlist]);


    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen text-lg text-gray-500 font-medium">
                Loading your wishlist...
            </div>
        );

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-6 px-6 md:px-12 font-body overflow-hidden">
            <Toaster position="top-right" />

            {/* Floating hearts animation layer */}
            <AnimatePresence>
                {removedHearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        animate={{ opacity: 0, scale: 1.8, y: -120 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="fixed z-[9999] text-pink-500 text-3xl select-none pointer-events-none drop-shadow-[0_0_10px_rgba(255,100,150,0.6)]"
                        style={{
                            left: heart.x,
                            top: heart.y,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </AnimatePresence>


            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div
                    onClick={() => router.push("/products")}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <FaArrowLeft className="text-2xl text-gray-700 group-hover:text-indigo-600 transition" />
                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-semibold text-gray-800 tracking-tight"
                    >
                        My Wishlist
                    </motion.h1>
                </div>

                <div
                    onClick={() => router.push("/cart")}
                    className="flex items-center gap-3 cursor-pointer hover:scale-105 transition"
                >
                    <div className="relative">
                        <FaShoppingCart className="text-2xl text-gray-800" />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {wishlist.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            {wishlist.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex gap-3 overflow-x-auto mb-10 pb-2 scrollbar-thin scrollbar-thumb-gray-300"
                >
                    {categories.map((cat) => (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 text-sm md:text-base rounded-full font-medium flex-shrink-0 border transition-all shadow-sm 
              ${activeCategory === cat
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                                }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Empty Wishlist */}
            {filteredWishlist.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center mt-24 text-center"
                >
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 opacity-30 blur-2xl"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 120 }}
                            className="text-6xl"
                        >
                            💔
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Your wishlist is empty
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Start adding your favorite products to keep track of them here.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/products")}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                        Browse Products
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                >
                    <AnimatePresence>
                        {filteredWishlist.map((product, index) => (
                            <motion.div
                                key={product._id || `${product.title}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => router.push(`/product/${product.slug}`)}
                                className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all hover:-translate-y-1"
                            >
                                {/* Remove button */}
                                <button
                                    onClick={(e) => removeFromWishlist(product._id, e)}
                                    className="absolute top-3 right-3 bg-transparent text-white rounded-full p-2 hover:bg-red-600 transition z-10"
                                >
                                    ✕
                                </button>

                                {/* Product Image */}
                                <div className="h-60 w-full overflow-hidden">
                                    <img
                                        src={
                                            product.media?.[0] ||
                                            product.colors?.[0]?.images?.[0] ||
                                            "/placeholder.png"
                                        }
                                        alt={product.title}
                                        className="w-full h-full object-fill transition-transform duration-500 hover:scale-105"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="text-gray-900 font-semibold text-lg mb-1 truncate">
                                        {product.name || product.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-indigo-600 font-bold text-xl">
                                            ₹{product.discountPrice ?? product.price}
                                        </span>
                                        {product.discountPrice < product.price && (
                                            <span className="text-gray-400 line-through text-sm">
                                                ₹{product.price}
                                            </span>
                                        )}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={(e) => moveToCart(product._id, e)}
                                        className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 shadow-sm transition-all"
                                    >
                                        Move to Cart
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}