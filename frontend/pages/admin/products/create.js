// pages/admin/create-product.js
import { useState } from 'react';
import axios from '@/utils/axios';
import { useRouter } from 'next/router';
import withAdminAuth from '@/utils/withAdminAuth';
import Navbar from '@/components/Navbar';
//working
const CreateProduct = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        tags: '',
        weight: '',
        quantity: '',
    });

    // Set default valid hex color to avoid input validation errors
    const [colors, setColors] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle standard input changes
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Handle product image selection
    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    // Handle changes to individual color fields
    const handleColorChange = (index, field, value) => {
        const updated = [...colors];
        updated[index][field] = value;
        setColors(updated);
    };

    // Handle color image file input
    const handleColorImageChange = (index, file) => {
        const updated = [...colors];
        updated[index].image = file;
        setColors(updated);
    };

    // Add a new color input group with default valid color code
    const addColor = () => {
        setColors([...colors, { colorName: '', colorCode: '#000000', image: null }]);
    };

    // Remove a color input group
    const removeColor = (index) => {
        const updated = [...colors];
        updated.splice(index, 1);
        setColors(updated);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const data = new FormData();

        // Append basic fields, convert tags string to JSON array
        Object.entries(formData).forEach(([key, val]) => {
            if (key === 'tags') {
                const tagsArray = val.split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                data.append('tags', JSON.stringify(tagsArray));
            } else {
                data.append(key, val);
            }
        });

        // Append main product images
        images.forEach((file) => {
            data.append('images', file);
        });

        // Build colors JSON (excluding image) and append images separately
        const cleanColors = colors.map(({ colorName, colorCode }) => ({ colorName, colorCode }));
        data.append('colors', JSON.stringify(cleanColors));

        colors.forEach(({ image }) => {
            if (image) {
                data.append('colorImages', image);
            }
        });

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            router.push('/admin/products'); // Redirect to product list
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md pt-[7rem] md:pt-[11rem]">
                <h1 className="text-3xl font-heading text-primary mb-6">Create New Product</h1>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Category *</label>
                            <input
                                type="text"
                                name="category"
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Discount Price</label>
                            <input
                                type="number"
                                name="discountPrice"
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Weight (kg) *</label>
                            <input
                                type="number"
                                name="weight"
                                step="0.01"
                                required
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Product Media */}
                    <div>
                        <label className="block mb-1 font-medium">Product Images / Videos</label>
                        <input
                            type="file"
                            name="images"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 p-2 rounded-md"
                        />
                    </div>

                    {/* Toggle: Has color variants */}
                    <div className="mt-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={colors.length > 0}
                                onChange={(e) =>
                                    setColors(
                                        e.target.checked
                                            ? [{ colorName: '', colorCode: '#000000', image: null }]
                                            : []
                                    )
                                }
                                className="mr-2 accent-primary"
                            />
                            This product has color variants
                        </label>
                    </div>

                    {/* Color Variants */}
                    {colors.length > 0 && (
                        <div className="border p-4 rounded-md bg-gray-50 mt-4">
                            <label className="block text-lg font-medium mb-3 text-primary">
                                Color Variants
                            </label>

                            {colors.map((color, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center mb-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Color Name"
                                        value={color.colorName}
                                        onChange={(e) => handleColorChange(index, 'colorName', e.target.value)}
                                        className="border border-gray-300 p-2 rounded-md"
                                    />

                                    <input
                                        type="color"
                                        value={color.colorCode}
                                        onChange={(e) => handleColorChange(index, 'colorCode', e.target.value)}
                                        className="border border-gray-300 h-10 w-full rounded-md"
                                    />

                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleColorImageChange(index, e.target.files[0])}
                                        className="border border-gray-300 p-2 rounded-md"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeColor(index)}
                                        className="text-red-600 hover:underline text-sm"
                                        disabled={colors.length === 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addColor}
                                className="mt-2 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                            >
                                + Add Another Color
                            </button>
                        </div>
                    )}


                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default withAdminAuth(CreateProduct);