"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { FaRegHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added
import { useWishlist } from "@/context/WishlistContext";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import ProductFeedback from "./ProductFeedback";
import RecommendedProducts from "./RecommendedProducts";

const ProductDetail = ({ product, user }) => {
    const { wishlist, toggleWishlist } = useWishlist();
    const [floatingHearts, setFloatingHearts] = useState([]); // ❤️ floating hearts
    const [isZoomed, setIsZoomed] = useState(false);
    const [selectedColor, setSelectedColor] = useState(
        product.colors?.[0] || null
    );
    const [selectedImage, setSelectedImage] = useState(
        product.colors?.[0]?.images?.[0] || product.media?.[0] || ""
    );

    const basePrice = selectedColor?.price ?? product.price;
    const discountPrice =
        selectedColor?.discountPrice ?? product.discountPrice ?? null;
    const currentPrice = discountPrice || basePrice;

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        if (color?.images?.length > 0) {
            setSelectedImage(color.images[0]);
        } else {
            setSelectedImage(product.media?.[0] || "");
        }
    };

    const handleImageSelect = (image) => setSelectedImage(image);

    useEffect(() => {
        if (selectedColor?.images?.length > 0) {
            setSelectedImage(selectedColor.images[0]);
        } else {
            setSelectedImage(product.media?.[0] || "");
        }
    }, [selectedColor, product.media]);

    const galleryImages = [
        ...(selectedColor?.images?.length ? selectedColor.images : []),
        ...(product.media?.filter(
            (m) => !(selectedColor?.images || []).includes(m)
        ) || []),
    ];

    const isInWishlist = wishlist.some(item => item._id === product._id);

    // ❤️ Floating Heart Animation
    const spawnHeart = (e, isAdding) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart = {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top,
            isAdding,
        };
        setFloatingHearts((prev) => [...prev, newHeart]);
        setTimeout(
            () =>
                setFloatingHearts((prev) =>
                    prev.filter((heart) => heart.id !== newHeart.id)
                ),
            1500
        );
    };

    // ===== react-spring + use-gesture for zoom =====
    const [{ x, y, scale }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 1,
        config: { tension: 300, friction: 30 },
    }));

    const imgRef = useRef(null);
    const getBoundaries = () => {
        if (!imgRef.current)
            return { xMax: 0, xMin: 0, yMax: 0, yMin: 0 };
        const rect = imgRef.current.getBoundingClientRect();
        const containerWidth = window.innerWidth * 0.95;
        const containerHeight = window.innerHeight * 0.9;
        const extraX = (rect.width * scale.get() - containerWidth) / 2;
        const extraY = (rect.height * scale.get() - containerHeight) / 2;
        return {
            xMin: -Math.max(extraX, 0),
            xMax: Math.max(extraX, 0),
            yMin: -Math.max(extraY, 0),
            yMax: Math.max(extraY, 0),
        };
    };

    const bind = useGesture(
        {
            onDrag: ({ offset: [dx, dy] }) => {
                const { xMin, xMax, yMin, yMax } = getBoundaries();
                api.start({
                    x: Math.min(Math.max(dx, xMin), xMax),
                    y: Math.min(Math.max(dy, yMin), yMax),
                });
            },
            onPinch: ({ offset: [s] }) => {
                const { xMin, xMax, yMin, yMax } = getBoundaries();
                api.start({
                    scale: s,
                    x: Math.min(Math.max(x.get(), xMin), xMax),
                    y: Math.min(Math.max(y.get(), yMin), yMax),
                });
            },
        },
        {
            drag: { from: () => [x.get(), y.get()] },
            pinch: { scaleBounds: { min: 1, max: 3 }, from: () => [scale.get()] },
        }
    );

    const handleImageClick = () => setIsZoomed(true);
    const handleCloseZoom = () => {
        setIsZoomed(false);
        api.start({ x: 0, y: 0, scale: 1 });
    };

    const lastTapRef = useRef(0);
    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
            api.start({ scale: scale.get() === 1 ? 2 : 1, x: 0, y: 0 });
        }
        lastTapRef.current = now;
    };

    return (
        <>
            <Navbar />

            {/* ❤️ Floating Hearts Layer */}
            <AnimatePresence>
                {floatingHearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1.8,
                            y: -120,
                            rotate: heart.isAdding ? 15 : -15,
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

            <section className="mt-[7rem] md:mt-[10rem] bg-white transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-10">
                        {/* 🖼️ Product Image Section */}
                        <div className="flex-1">
                            <div
                                className="relative overflow-hidden rounded-lg shadow-lg cursor-zoom-in"
                                onClick={handleImageClick}
                            >
                                <img
                                    key={selectedImage}
                                    src={selectedImage}
                                    alt={`${product.name} ${selectedColor?.colorName || ""}`}
                                    className="w-[380px] h-[420px] sm:w-[900px] md:w-[600px] object-fill md:object-fill rounded-lg transition-all duration-500 ease-in-out"
                                />
                            </div>

                            {/* 🩶 Thumbnails */}
                            {galleryImages.length > 0 && (
                                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                                    {galleryImages.map((image, i) => (
                                        <img
                                            key={i}
                                            src={image}
                                            alt={`thumb-${i}`}
                                            onClick={() => handleImageSelect(image)}
                                            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === image
                                                ? "border-accent scale-105"
                                                : "border-transparent"
                                                } transition-all duration-200 hover:scale-110`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 🔍 Zoom Modal */}
                        {isZoomed && (
                            <div
                                onClick={handleCloseZoom}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 cursor-zoom-out"
                            >
                                <animated.img
                                    ref={imgRef}
                                    {...bind()}
                                    src={selectedImage}
                                    alt="Zoomed product"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDoubleTap();
                                    }}
                                    style={{
                                        x,
                                        y,
                                        scale,
                                        touchAction: "none",
                                        maxWidth: "95%",
                                        maxHeight: "90vh",
                                    }}
                                    className="rounded-lg"
                                />
                            </div>
                        )}

                        {/* 🛍️ Product Details */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-semibold text-primary">
                                {product.name}
                            </h1>
                            <div className="flex items-center mt-3 gap-2">
                                <p className="text-3xl md:text-4xl font-bold text-accent">
                                    ₹{currentPrice}
                                </p>
                                {selectedColor?.discountPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        ₹{basePrice}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 mt-4 leading-relaxed">
                                {product.description}
                            </p>

                            {/* 🎨 Color Options */}
                            {product.colors?.some(
                                (c) => c.colorName || (c.images?.length > 0)
                            ) && (
                                    <div className="mt-6">
                                        <h4 className="text-xl font-semibold text-primary mb-2">
                                            Available Colors
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors
                                                .filter((c) => c.colorName || (c.images?.length > 0))
                                                .map((color) => (
                                                    <button
                                                        key={color.colorName || color.colorCode}
                                                        title={color.colorName}
                                                        onClick={() => handleColorSelect(color)}
                                                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${selectedColor?.colorName === color.colorName
                                                            ? "border-accent ring-2 ring-accent scale-110"
                                                            : "border-gray-300 hover:scale-110"
                                                            }`}
                                                        style={{ backgroundColor: color.colorCode }}
                                                    />
                                                ))}
                                        </div>
                                        {selectedColor?.colorName && (
                                            <p className="mt-2 text-gray-600 text-sm">
                                                Selected:{" "}
                                                <span className="font-medium">
                                                    {selectedColor.colorName}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* Buttons */}
                            <div className="mt-8 flex items-center gap-3">
                                <button className="flex-1 py-3 bg-accent min-w-[320px] text-white rounded-lg text-lg font-bold transition hover:bg-primary">
                                    Add to Cart
                                </button>
                                <button
                                    onClick={(e) => {
                                        spawnHeart(e, !isInWishlist);
                                        toggleWishlist(product._id);
                                    }}
                                    aria-label="Toggle wishlist"
                                    className="p-3 rounded-lg border border-gray-300 hover:shadow-md transition relative z-10"
                                >
                                    <FaRegHeart
                                        className="text-2xl transition-colors duration-300"
                                        style={{
                                            color: isInWishlist ? "#F4C2C2" : "rgba(0, 0, 0, 0.4)",
                                        }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ProductFeedback productId={product._id} userId={user?.id} />

            <RecommendedProducts
                category={product.category}
                currentProductId={product._id}
            />
        </>
    );
};

export default ProductDetail;