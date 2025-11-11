"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import { FaRegHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";

const ProductGrid = ({ products }) => {
    const { wishlist, toggleWishlist } = useWishlist();
    const [floatingHearts, setFloatingHearts] = useState([]);

    // Function to spawn floating heart animation
    const spawnHeart = (e, isAdding) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart = {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top,
            isAdding,
        };
        setFloatingHearts((prev) => [...prev, newHeart]);

        // remove after animation ends
        setTimeout(
            () =>
                setFloatingHearts((prev) =>
                    prev.filter((heart) => heart.id !== newHeart.id)
                ),
            1500
        );
    };

    return (
        <>
            <Navbar />

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

            <section className="mt-[7rem] md:mt-[11rem]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6 px-2">
                        {(products || []).map((product) => {
                            const isWishlisted = wishlist.some(item => item._id === product._id);

                            return (
                                <Link
                                    key={product._id}
                                    href={`/product/${product.slug || product._id}`}
                                    passHref
                                >
                                    <div className="bg-white shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer mb-4 relative rounded-lg overflow-hidden">
                                        {/* Sale Badge */}
                                        {product.saleTitle && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                                {product.saleTitle}
                                            </span>
                                        )}

                                        {/* Image */}
                                        <div className="overflow-hidden">
                                            <img
                                                src={
                                                    product.media?.[0] ||
                                                    product.colors?.[0]?.images?.[0] ||
                                                    "/placeholder.png"
                                                }
                                                alt={product.name}
                                                className="w-full h-48 object-cover transition duration-300 ease-in-out hover:scale-110"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 flex flex-col justify-between h-full relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold font-heading text-primary text-left truncate w-full">
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
                                                    className="ml-2 relative z-10"
                                                >
                                                    <FaRegHeart
                                                        className={`text-xl transition-all duration-300 ${isWishlisted
                                                            ? "text-pink-400 scale-110"
                                                            : "text-gray-400 hover:text-pink-300"
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mt-2">
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
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductGrid;