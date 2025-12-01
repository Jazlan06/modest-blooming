// pages/sale.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductGrid from '@/components/ProductGrid';
import Navbar from '@/components/Navbar';
import Filter from '@/components/Filter';
import Head from 'next/head';
export default function SalePage({ initialProducts, filterOptions }) {
    const [products, setProducts] = useState(initialProducts.products || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialProducts.totalPages || 1);

    const router = useRouter();
    const { query } = router;
    const page = parseInt(query.page) || 1;

    useEffect(() => {
        // Ensure `sale=true` is always in query
        if (query.sale !== 'true') {
            router.replace({
                pathname: router.pathname,
                query: { ...query, sale: 'true' },
            });
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(query);
                params.set('sale', 'true'); // ✅ ensure only sale products
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
                console.error('Error fetching sale products:', error);
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
                <title>Sale on Modest Blooming | Hijabs, Scarves & Modest Fashion Discounts</title>
                <meta
                    name="description"
                    content="Shop the latest sale on Modest Blooming! Get exclusive discounts on hijabs, scarves, modest clothing, and accessories. Limited time offers for trendy modest fashion."
                />
                <meta
                    name="keywords"
                    content="modest fashion sale, hijab sale, scarf discounts, women's modest clothing offers, modest accessories sale, Islamic fashion discounts, Modest Blooming deals, online hijab store sale"
                />
                <meta property="og:title" content="Sale on Modest Blooming – Hijabs & Modest Fashion Discounts" />
                <meta
                    property="og:description"
                    content="Discover the best deals on hijabs, scarves, modest clothing, and accessories at Modest Blooming. Limited-time sale for fashion-forward modest wear."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/sale" />
                <meta property="og:image" content="https://www.modestblooming.com/og-image-sale.jpg" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://www.modestblooming.com/sale" />
            </Head>
            <Navbar />
            <div className="container mx-auto py-6">
                <Filter filterOptions={filterOptions} />

                {loading ? (
                    <div className="text-center py-10 text-gray-600 font-semibold">
                        Loading...
                    </div>
                ) : products.length ? (
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
                ) : (
                    <div className="text-center py-20 text-gray-500 text-lg font-semibold">
                        No active sales match your filters.
                    </div>
                )}
            </div>
        </>
    );
}

// ✅ Server-Side Data
export async function getServerSideProps() {
    try {
        // Fetch sale products
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?sale=true&page=1&limit=20`);
        const data = await res.json();

        // Fetch filter options for sale products
        const filterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/filter-options?sale=true`);
        const filterData = await filterRes.json();

        return {
            props: {
                initialProducts: data,
                filterOptions: filterData || {},
            },
        };
    } catch (error) {
        console.error('Error fetching sale products:', error);
        return {
            props: {
                initialProducts: { products: [], totalPages: 1 },
                filterOptions: {},
            },
        };
    }
}
