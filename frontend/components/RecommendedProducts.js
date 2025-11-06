import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/utils/axios';
import { FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '@/context/WishlistContext';
import { motion } from 'framer-motion';

const RecommendedProducts = ({ category, currentProductId }) => {
    const { wishlist, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500 font-body animate-pulse">
                Loading recommendations...
            </div>
        );
    }

    if (!products.length) return null;

    return (
        <section className="mt-16 mb-12 max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold font-heading text-gray-900 mb-6 text-center">
                You may also like
            </h2>

            <div className="flex space-x-5 overflow-x-auto hide-scrollbar py-4">
                {products.map((product) => (
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
                                            '/placeholder.jpg'
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
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(product._id);
                                            }}
                                            aria-label="Toggle wishlist"
                                            className="ml-2"
                                        >
                                            <FaRegHeart
                                                className="text-xl transition-colors duration-300"
                                                style={{
                                                    color: wishlist.includes(product._id)
                                                        ? '#F4C2C2'
                                                        : 'rgba(0, 0, 0, 0.3)',
                                                }}
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
                ))}
            </div>
        </section>
    );
};

export default RecommendedProducts;