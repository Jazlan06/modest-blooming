// components/ProductGrid.js
import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import { FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '@/context/WishlistContext';

const ProductGrid = ({ products }) => {
    const { wishlist, toggleWishlist } = useWishlist();

    return (
        <>
            <Navbar />
            <section className="mt-[7rem] md:mt-[11rem]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6 px-2">
                        {/* SAFEGUARD: products always an array */}
                        {(products || []).map((product) => (
                            <Link
                                key={product._id}
                                href={`/product/${product.slug || product._id}`}
                                passHref
                            >
                                <div className="bg-white shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer mb-4 relative">
                                    <div className="overflow-hidden">
                                        <img
                                            src={
                                                product.media?.[0] ||
                                                product.colors?.[0]?.images?.[0]
                                            }
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition duration-300 ease-in-out hover:scale-110"
                                        />
                                    </div>

                                    <div className="p-4 flex flex-col justify-between h-full relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold font-heading text-primary text-left truncate w-full">
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
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductGrid;