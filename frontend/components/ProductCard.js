// components/ProductCard.js
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '@/context/WishlistContext';
import Navbar from './Navbar';

export default function ProductCard({ product }) {
    const { wishlist, toggleWishlist } = useWishlist();

    return (
        <>
            <Navbar />
            <div className='mt-[4rem] sm:mt-[7rem]'>
                <div className="bg-white shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer mb-4">
                    <Link href={`/product/${product.slug || product._id}`} passHref>
                        <div className="overflow-hidden">
                            <img
                                src={product.media[0] || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-48 sm:h-55 md:h-60 object-fill transition duration-300 ease-in-out hover:scale-110"
                            />
                        </div>

                        <div className="p-4 pb-2">
                            {/* Title and Wishlist Button */}
                            <div className="flex justify-between items-start mb-4">
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

                            {/* Price and Discount */}
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xl font-bold font-body text-accent mt-2">
                                    ₹{product.discountPrice || product.price}
                                </p>
                                {product.discountPrice && (
                                    <span className="text-lg font-body line-through text-gray-500 mt-2">
                                        ₹{product.price}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}