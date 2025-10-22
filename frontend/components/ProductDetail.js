import React, { useState } from 'react';
import { useRouter } from 'next/router';

const ProductDetail = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(product.media[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]?.colorName);

    const router = useRouter();

    const handleImageChange = (image) => setSelectedImage(image);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Product Image Carousel */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="flex-1">
                        <div className="relative">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-[400px] object-cover rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
                            />
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {product.media.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`image-${index}`}
                                    onClick={() => handleImageChange(image)}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer transition-transform duration-200 transform hover:scale-110"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-semibold text-primary">{product.name}</h1>
                        <div className="flex items-center mt-2">
                            <p className="text-2xl font-bold text-accent">
                                ₹{product.discountPrice || product.price}
                            </p>
                            {product.discountPrice && (
                                <span className="text-xl text-gray-600 line-through ml-2">
                                    ₹{product.price}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-700 mt-4">{product.description}</p>

                        {/* Color/Variant Selector */}
                        <div className="mt-6">
                            <h4 className="text-xl font-semibold text-primary">Choose Color</h4>
                            <div className="flex gap-4 mt-4">
                                {product.colors.map(color => (
                                    <button
                                        key={color.colorName}
                                        className={`w-10 h-10 rounded-full ${color.colorCode} border-2 ${selectedColor === color.colorName ? 'border-accent' : 'border-transparent'}`}
                                        onClick={() => setSelectedColor(color.colorName)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="mt-6">
                            <button
                                className="w-full py-3 bg-accent text-white rounded-lg text-lg font-bold transition duration-300 hover:bg-primary"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetail;
