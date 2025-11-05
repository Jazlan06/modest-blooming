// pages/admin/products/[id]/colors.js
import { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/router";
import withAdminAuth from "@/utils/withAdminAuth";
import Navbar from "@/components/Navbar";

const ManageColors = () => {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
            setProduct(res.data);
            setColors(res.data.colors || []);
        } catch (err) {
            setError("Failed to load product details");
        }
    };

    const handleColorChange = (index, field, value) => {
        const updated = [...colors];
        updated[index][field] = value;
        setColors(updated);
    };

    const handleColorImagesChange = (index, files) => {
        const updated = [...colors];
        updated[index].images = files; // store array of File objects
        setColors(updated);
    };

    const addColor = () => {
        setColors([...colors, { colorName: "", colorCode: "#000000", images: [] }]);
    };

    const removeColor = (index) => {
        const updated = [...colors];
        updated.splice(index, 1);
        setColors(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();

            data.append("name", product.name);
            data.append("description", product.description);
            data.append("price", product.price);
            data.append("discountPrice", product.discountPrice || "");
            data.append("category", product.category);
            data.append("weight", product.weight);
            data.append("quantity", product.quantity);
            data.append("tags", JSON.stringify(product.tags));

            // Prepare colors array with null images if they are files
            const cleanColors = colors.map(({ colorName, colorCode, price, discountPrice, weight, images }) => ({
                colorName,
                colorCode,
                price,
                discountPrice,
                weight,
                images: images?.map(img => (img instanceof File ? null : img)) || [],
            }));

            data.append("colors", JSON.stringify(cleanColors));

            // Append all images
            colors.forEach((color, index) => {
                if (color.images && color.images.length > 0) {
                    color.images.forEach((file) => {
                        if (file instanceof File) {
                            data.append("colorImages", file);
                        }
                    });
                }
            });

            const token = localStorage.getItem("token");

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            router.push(`/admin/products/${id}/edit`);
        } catch (err) {
            setError(err.response?.data?.message || "Error updating colors");
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="text-center text-gray-600 mt-32 text-lg">Loading product...</div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md pt-[7rem] md:pt-[11rem]">
                <h1 className="text-3xl font-heading text-primary mb-6">
                    Manage Colors - {product.name}
                </h1>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    <div className="border p-4 rounded-md bg-gray-50">
                        <label className="block text-lg font-medium mb-3 text-primary">
                            Color Variants
                        </label>

                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mb-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Color Name"
                                    value={color.colorName}
                                    onChange={(e) => handleColorChange(index, "colorName", e.target.value)}
                                    className="border border-gray-300 p-2 rounded-md"
                                    required
                                />

                                <input
                                    type="color"
                                    value={color.colorCode || "#000000"}
                                    onChange={(e) => handleColorChange(index, "colorCode", e.target.value)}
                                    className="border border-gray-300 h-10 w-full rounded-md"
                                    required
                                />

                                <input
                                    type="number"
                                    placeholder="Price (optional)"
                                    value={color.price || ""}
                                    onChange={(e) => handleColorChange(index, "price", e.target.value)}
                                    className="border border-gray-300 p-2 rounded-md"
                                />

                                <input
                                    type="number"
                                    placeholder="Discount (optional)"
                                    value={color.discountPrice || ""}
                                    onChange={(e) => handleColorChange(index, "discountPrice", e.target.value)}
                                    className="border border-gray-300 p-2 rounded-md"
                                />

                                <div className="flex flex-col items-start gap-2">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={(e) => handleColorImagesChange(index, Array.from(e.target.files))}
                                        className="border border-gray-300 p-2 rounded-md"
                                    />

                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {color.images?.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img instanceof File ? URL.createObjectURL(img) : img}
                                                alt="color preview"
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>

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

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Colors"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default withAdminAuth(ManageColors);