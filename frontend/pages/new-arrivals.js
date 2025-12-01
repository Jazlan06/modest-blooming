// pages/new-arrivals.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductGrid from '@/components/ProductGrid';
import Navbar from '@/components/Navbar';
import Filter from '@/components/Filter';
import Head from 'next/head';
export default function NewArrivalsPage({ initialProducts, filterOptions }) {
    const [products, setProducts] = useState(initialProducts.products || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialProducts.totalPages || 1);

    const router = useRouter();
    const { query } = router;
    const page = parseInt(query.page) || 1;

    useEffect(() => {
        if (!query.newArrival) {
            router.replace({
                pathname: router.pathname,
                query: { ...query, newArrival: 'true' },
            });
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(query);
                params.set('newArrival', 'true'); // ✅ ensure only 30-day products
                if (!params.has('page')) params.set('page', 1);
                if (!params.has('limit')) params.set('limit', 20);

                const url =
                    params.has('category') ||
                        params.has('tags') ||
                        params.has('colors') ||
                        params.has('minPrice') ||
                        params.has('maxPrice')
                        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/filter?${params}`
                        : `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params}`;

                const res = await fetch(url);
                const data = await res.json();

                if (res.ok) {
                    if (url.includes('/filter')) {
                        setProducts(data);
                        setTotalPages(1);
                    } else {
                        setProducts(data.products);
                        setTotalPages(data.totalPages);
                    }
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching new arrivals:', error);
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
            <Head>
                {/* Page Title */}
                <title>New Arrivals | Modest Blooming</title>

                {/* Meta Description */}
                <meta
                    name="description"
                    content="Discover the latest hijabs, scarves, and accessories at Modest Blooming. Shop our new arrivals and stay trendy with modest fashion."
                />

                {/* Robots */}
                <meta name="robots" content="index, follow" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://www.modestblooming.com/new-arrivals" />

                {/* Open Graph / Social Media */}
                <meta property="og:title" content="New Arrivals | Modest Blooming" />
                <meta
                    property="og:description"
                    content="Check out the latest collection of hijabs, scarves, and stylish accessories at Modest Blooming. Shop new arrivals now!"
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/new-arrivals" />
                <meta property="og:image" content="https://www.modestblooming.com/new-arrivals-banner.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="New Arrivals | Modest Blooming" />
                <meta
                    name="twitter:description"
                    content="Discover the latest hijabs, scarves, and accessories at Modest Blooming. Shop new arrivals today!"
                />
                <meta name="twitter:image" content="https://www.modestblooming.com/new-arrivals-banner.jpg" />
            </Head>
            <Navbar />
            <div className="container mx-auto py-6">
                <Filter filterOptions={filterOptions} />

                {loading ? (
                    <div className="text-center py-10 text-gray-600 font-semibold">
                        Loading...
                    </div>
                ) : (
                    <>
                        <ProductGrid products={products} />

                        {/* Pagination */}
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

// ✅ Server-Side Data
export async function getServerSideProps() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?newArrival=true&page=1&limit=20`);
        const data = await res.json();

        const filterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/filter-options?newArrival=true`);
        const filterData = await filterRes.json();

        return {
            props: {
                initialProducts: data,
                filterOptions: filterData || {},
            },
        };
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        return {
            props: {
                initialProducts: { products: [], totalPages: 1 },
                filterOptions: {},
            },
        };
    }
}