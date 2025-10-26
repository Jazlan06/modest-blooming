import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import { useRouter } from 'next/router';
import withAdminAuth from '@/utils/withAdminAuth';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const EditProduct = () => {
    const router = useRouter();
    const { id } = router.query;

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

    const [colors, setColors] = useState([]);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
                const product = res.data;

                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    discountPrice: product.discountPrice || '',
                    category: product.category,
                    tags: product.tags.join(', '),
                    weight: product.weight,
                    quantity: product.quantity || '',
                });

                setColors(product.colors || []);
                setExistingImages(product.media || []);
            } catch (err) {
                setError('Failed to load product');
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleColorChange = (index, field, value) => {
        const updated = [...colors];
        updated[index][field] = value;
        setColors(updated);
    };

    const handleColorImageChange = (index, file) => {
        const updated = [...colors];
        updated[index].image = file;
        setColors(updated);
    };

    const addColor = () => {
        setColors([...colors, { colorName: '', colorCode: '#000000', image: null }]);
    };

    const removeColor = (index) => {
        const updated = [...colors];
        updated.splice(index, 1);
        setColors(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const data = new FormData();

        Object.entries(formData).forEach(([key, val]) => {
            if (key === 'tags') {
                const tagsArray = val.split(',').map(tag => tag.trim());
                data.append('tags', JSON.stringify(tagsArray));
            } else {
                data.append(key, val);
            }
        });

        images.forEach(file => {
            data.append('images', file);
        });

        const cleanColors = colors.map(({ colorName, colorCode }) => ({
            colorName,
            colorCode
        }));
        data.append('colors', JSON.stringify(cleanColors));

        colors.forEach(({ image }) => {
            if (image instanceof File) {
                data.append('colorImages', image);
            }
        });

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            router.push('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md pt-[7rem] md:pt-[11rem]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-heading text-primary">Edit Product</h1>
                    <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
                        ← Back to Products
                    </Link>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                placeholder="Product Name"
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
                                value={formData.category}
                                placeholder="Category"
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
                            value={formData.description}
                            placeholder="Description"
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
                                value={formData.price}
                                placeholder="Price"
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
                                value={formData.discountPrice}
                                placeholder="Discount Price"
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Weight (kg) *</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                placeholder="Weight"
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
                            value={formData.tags}
                            placeholder="Tags"
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
                            placeholder="Quantity"
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Product Media */}
                    {existingImages.length > 0 && (
                        <div>
                            <label className="block mb-1 font-medium">Current Images</label>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {existingImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Product Media ${idx}`}
                                        className="w-24 h-24 object-cover rounded-md border"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block mb-1 font-medium">Upload New Images</label>
                        <input
                            type="file"
                            name="images"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Color Variants */}
                    <div className="border p-4 rounded-md">
                        <label className="block mb-2 font-medium">Color Variants</label>
                        {colors.map((color, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border-b pb-4">
                                <div>
                                    <label className="block mb-1 font-medium">Color Name</label>
                                    <input
                                        type="text"
                                        placeholder="Color Name"
                                        value={color.colorName}
                                        onChange={(e) =>
                                            handleColorChange(index, 'colorName', e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Color Code</label>
                                    <input
                                        type="color"
                                        value={color.colorCode}
                                        onChange={(e) =>
                                            handleColorChange(index, 'colorCode', e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Color Image</label>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) =>
                                            handleColorImageChange(index, e.target.files[0])
                                        }
                                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeColor(index)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md self-center"
                                    disabled={colors.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addColor}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Add Color Variant
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default withAdminAuth(EditProduct);
