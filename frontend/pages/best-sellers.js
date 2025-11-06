// best-sellers.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductGrid from '@/components/ProductGrid';
import Navbar from '@/components/Navbar';
import Filter from '@/components/Filter';

export default function BestSellersPage({ initialProducts, filterOptions }) {
    const [products, setProducts] = useState(initialProducts.products || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialProducts.totalPages || 1);

    const router = useRouter();
    const { query } = router;
    const page = parseInt(query.page) || 1;

    useEffect(() => {
        if (!query.bestSelling) {
            router.replace({
                pathname: router.pathname,
                query: { ...query, bestSelling: 'true' },
            });
        }
    }, []);


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(query);
                params.set('bestSelling', 'true'); // ensure we only fetch best-selling products
                if (!params.has('page')) params.set('page', 1);
                if (!params.has('limit')) params.set('limit', 20);

                const url =
                    params.has('category') ||
                        params.has('tags') ||
                        params.has('colors') ||
                        params.has('minPrice') ||
                        params.has('maxPrice')
                        ? `http://localhost:5000/api/products/filter?${params}`
                        : `http://localhost:5000/api/products?${params}`;

                const res = await fetch(url);
                const data = await res.json();

                if (res.ok) {
                    if (url.includes('/filter')) {
                        setProducts(data);
                        setTotalPages(1); // optional, you may implement pagination for filters separately
                    } else {
                        setProducts(data.products);
                        setTotalPages(data.totalPages);
                    }
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching best-selling products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    const changePage = (newPage) => {
        router.push({
            pathname: router.pathname,
            query: { ...query, page: newPage },
        });
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto py-6">
                <Filter filterOptions={filterOptions} />

                {loading ? (
                    <div className="text-center py-10 text-gray-600 font-semibold">Loading...</div>
                ) : (
                    <>
                        <ProductGrid products={products} />

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center mt-10 space-x-2">
                            <button
                                onClick={() => changePage(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changePage(i + 1)}
                                    className={`px-3 py-2 border rounded-md ${page === i + 1
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => changePage(page + 1)}
                                disabled={page >= totalPages}
                                className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// Server-Side Rendering
export async function getServerSideProps() {
    try {
        const res = await fetch('http://localhost:5000/api/products?bestSelling=true&page=1&limit=20');
        const data = await res.json();

        const filterRes = await fetch('http://localhost:5000/api/products/filter-options?bestSelling=true');
        const filterData = await filterRes.json();

        return {
            props: {
                initialProducts: data,
                filterOptions: filterData || {},
            },
        };
    } catch (error) {
        console.error('Error fetching best-selling products:', error);
        return {
            props: {
                initialProducts: { products: [], totalPages: 1 },
                filterOptions: {},
            },
        };
    }
}
