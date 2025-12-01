import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import Filter from '@/components/Filter';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import Head from 'next/head';
export default function ProductsPage({ initialData, filterOptions }) {
    const [products, setProducts] = useState(initialData.products || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
    const router = useRouter();
    const { query } = router;
    const page = parseInt(query.page) || 1;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(query);
                if (!params.has('page')) params.set('page', 1);
                if (!params.has('limit')) params.set('limit', 20);

                // Use filter endpoint if any filter query exists
                const url = params.has('category') || params.has('tags') || params.has('colors') || params.has('minPrice') || params.has('maxPrice')
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/filter?${params}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params}`;

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok) {
                    // filter endpoint returns array directly, getAllProducts returns { products, totalPages }
                    if (url.includes('/filter')) {
                        setProducts(data);
                        setTotalPages(1); // optional, you may implement pagination on filter separately
                    } else {
                        setProducts(data.products);
                        setTotalPages(data.totalPages);
                    }
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]); // <-- ensures fetch runs on any query change

    const changePage = (newPage) => {
        router.push({
            pathname: router.pathname,
            query: { ...query, page: newPage },
        });
    };

    return (
        <>
            <Head>
                <title>Shop Trendy Modest Fashion | Hijabs, Scarves & Accessories - Modest Blooming</title>
                <meta
                    name="description"
                    content="Discover the latest collection of hijabs, scarves, modest clothing, and stylish accessories at Modest Blooming. Shop trendy colors, premium fabrics, and elegant designs for women who love modest fashion."
                />
                <meta
                    name="keywords"
                    content="modest fashion, hijabs online, scarves for women, modest clothing, stylish hijabs, trendy hijabs, women's accessories, modest style, fashionable scarves, modest outfits, hijab shop, modest accessories, Islamic fashion, women's fashion"
                />
                <meta property="og:title" content="Shop Trendy Modest Fashion | Modest Blooming" />
                <meta
                    property="og:description"
                    content="Browse our latest collection of hijabs, scarves, and modest fashion accessories. Quality fabrics, elegant designs, and trendy styles for women."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/products" />
                <meta property="og:image" content="https://www.modestblooming.com/og-image-products.jpg" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://www.modestblooming.com/products" />
            </Head>
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
            <Footer />
        </>
    );
}

// Server-Side Rendering
export async function getServerSideProps() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?page=1&limit=20`);
        const data = await res.json();

        const filterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/filter-options`);
        const filterData = await filterRes.json();

        return {
            props: {
                initialData: data,
                filterOptions: filterData || {},
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            props: {
                initialData: { products: [], totalPages: 1 },
                filterOptions: {},
            },
        };
    }
}