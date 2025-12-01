// best-sellers.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductGrid from '@/components/ProductGrid';
import Navbar from '@/components/Navbar';
import Filter from '@/components/Filter';
import Head from 'next/head';
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
                        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/filter?${params}`
                        : `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params}`;

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
            <Head>
                <title>Best Selling Products | Modest Blooming</title>
                <meta
                    name="description"
                    content="Discover the top-selling hijabs, abayas, jilbabs, and accessories at Modest Blooming. Shop our most popular collections loved by customers worldwide."
                />
                <meta name="keywords" content="best selling hijabs, best abayas, top jilbabs, modest fashion, modest clothing, popular accessories" />
                <meta property="og:title" content="Best Selling Products | Modest Blooming" />
                <meta
                    property="og:description"
                    content="Explore Modest Blooming's most popular modest fashion items. Find the top hijabs, abayas, and accessories loved by our community."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://yourwebsite.com/best-sellers" />
                <meta property="og:image" content="https://yourwebsite.com/og-best-sellers.jpg" />
                <link rel="canonical" href="https://yourwebsite.com/best-sellers" />
            </Head>
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?bestSelling=true&page=1&limit=20`);
        const data = await res.json();

        const filterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/filter-options?bestSelling=true`);
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
