import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import withAdminAuth from '@/utils/withAdminAuth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
                setProducts(res.data);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 mt-[7rem]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-heading text-primary">All Products</h1>
                    <Link
                        href="/admin/products/create"
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                    >
                        + Add New Product
                    </Link>
                </div>

                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    <div className="overflow-x-auto mt-[3rem]">
                        <table className="min-w-full bg-white table-auto rounded-lg shadow-md">
                            <thead className="bg-primary text-white font-body">
                                <tr>
                                    <th className="py-3 px-4 text-left">Product Name</th>
                                    <th className="py-3 px-4 text-left">Category</th>
                                    <th className="py-3 px-4 text-left">Price</th>
                                    <th className="py-3 px-4 text-left">Stock Status</th>
                                    <th className="py-3 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 font-body">
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b hover:bg-gray-100">
                                        <td className="py-3 px-4">{product.name}</td>
                                        <td className="py-3 px-4">{product.category}</td>
                                        <td className="py-3 px-4">
                                            ₹{product.discountPrice || product.price}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`py-1 px-3 rounded-full ${
                                                    product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/admin/products/${product._id}/edit`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/admin/products/clone/${product._id}`}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Clone
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default withAdminAuth(ProductList);
