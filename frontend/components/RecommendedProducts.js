"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/utils/axios";

const RecommendedProducts = ({ category, currentProductId }) => {
    const { wishlist, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [floatingHearts, setFloatingHearts] = useState([]);

    const fetchRecommended = async () => {
        try {
            let res = await axios.get(`http://localhost:5000/api/products?category=${category}`);
            let related = res.data.products?.filter(p => p._id !== currentProductId) || [];

            // If only 0 or 1 in category → fetch random products
            if (related.length <= 1) {
                const randomRes = await axios.get(`http://localhost:5000/api/products?limit=8`);
                related = randomRes.data.products.filter(p => p._id !== currentProductId);
            }

            setProducts(related.slice(0, 8));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommended();
    }, [category, currentProductId]);

    // Floating heart animation logic
    const spawnHeart = (e, isAdding) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart = {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top,
            isAdding,
        };
        setFloatingHearts((prev) => [...prev, newHeart]);

        // Remove heart after animation ends
        setTimeout(
            () =>
                setFloatingHearts((prev) =>
                    prev.filter((heart) => heart.id !== newHeart.id)
                ),
            1500
        );
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500 font-body animate-pulse">
                Loading recommendations...
            </div>
        );
    }

    if (!products.length) return null;

    return (
        <section className="mt-16 mb-12 max-w-7xl mx-auto px-4 relative">
            {/* Floating Hearts Animation Layer */}
            <AnimatePresence>
                {floatingHearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1.8,
                            y: -120,
                            x: heart.isAdding ? Math.random() * 20 - 10 : Math.random() * -20 + 10,
                            rotate: heart.isAdding ? 20 : -20,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="fixed z-[9999] text-3xl select-none pointer-events-none drop-shadow-[0_0_10px_rgba(255,100,150,0.6)]"
                        style={{
                            left: heart.x,
                            top: heart.y,
                            color: heart.isAdding ? "#ff4b91" : "#999",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        {heart.isAdding ? "❤️" : "💔"}
                    </motion.div>
                ))}
            </AnimatePresence>

            <h2 className="text-3xl md:text-4xl font-semibold font-heading text-gray-900 mb-6 text-center">
                You may also like
            </h2>

            <div className="flex space-x-5 overflow-x-auto hide-scrollbar py-4">
                {products.map((product) => {
                    const isWishlisted = wishlist.some(item => item._id === product._id);

                    return (
                        <motion.div
                            key={product._id}
                            whileHover={{ y: -6 }}
                            className="bg-white shadow-md rounded-lg flex-shrink-0 w-64 md:w-72 cursor-pointer hover:shadow-lg transition relative"
                        >
                            <Link href={`/product/${product.slug || product._id}`} passHref>
                                <div>
                                    <div className="overflow-hidden rounded-t-lg">
                                        <img
                                            src={
                                                product.media?.[0] ||
                                                product.colors?.[0]?.images?.[0] ||
                                                "/placeholder.jpg"
                                            }
                                            alt={product.name}
                                            className="w-full h-48 object-fill transition duration-300 hover:scale-110"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold font-heading text-primary truncate w-full">
                                                {product.name}
                                            </h3>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    spawnHeart(e, !isWishlisted);
                                                    toggleWishlist(product._id);
                                                }}
                                                aria-label="Toggle wishlist"
                                                className="ml-2"
                                            >
                                                <FaRegHeart
                                                    className={`text-xl transition-all duration-300 ${isWishlisted
                                                            ? "text-pink-400 scale-110"
                                                            : "text-gray-400 hover:text-pink-300"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xl font-bold font-body text-accent">
                                                ₹{product.discountPrice || product.price}
                                            </p>
                                            {product.discountPrice && (
                                                <span className="text-lg font-body line-through text-gray-500">
                                                    ₹{product.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default RecommendedProducts;