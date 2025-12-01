// pages/search.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '@/components/ProductCard'; // Assuming you have a ProductCard component
import { FaSpinner } from 'react-icons/fa';
import Head from 'next/head';
export default function Search() {
    const router = useRouter();
    const { q } = router.query; // Get the query parameter from the URL
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    // Fetch products based on the query when the page loads or query changes
    useEffect(() => {
        if (!q) return; // Do nothing if there's no query

        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                // Making the request to your backend search API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${q}`);
                const data = await response.json();

                if (response.ok) {
                    setProducts(data);
                } else {
                    setError('No products found for your search.');
                }
            } catch (error) {
                setError('Failed to fetch products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [q]);

    useEffect(() => {
        if (q) setQuery(q);
    }, [q]);

    return (
        <>
            <Head>
                <title>{query ? `Search Results for "${query}" | Modest Blooming` : 'Search Products | Modest Blooming'}</title>
                <meta
                    name="description"
                    content={query ? `Find the best deals and latest collections for "${query}" at Modest Blooming. Browse hijabs, scarves, modest clothing, and accessories.`
                        : 'Search and discover hijabs, scarves, modest clothing, and accessories at Modest Blooming.'}
                />
                <meta
                    name="keywords"
                    content={query ? `search ${query}, ${query} online, ${query} sale, modest fashion ${query}, hijab ${query}, scarf ${query}, Modest Blooming products`
                        : 'modest fashion, hijabs, scarves, modest clothing, online shopping, Modest Blooming'}
                />
                <meta property="og:title" content={query ? `Search Results for "${query}" | Modest Blooming` : 'Search Products | Modest Blooming'} />
                <meta
                    property="og:description"
                    content={query ? `Explore "${query}" and find the latest modest fashion products including hijabs, scarves, and accessories.`
                        : 'Explore and shop hijabs, scarves, modest clothing, and accessories at Modest Blooming.'}
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://www.modestblooming.com/search?q=${query}`} />
                <meta property="og:image" content="https://www.modestblooming.com/og-image-search.jpg" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://www.modestblooming.com/search?q=${query}`} />
            </Head>
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-semibold mb-4">Search Results for "{q}"</h1>

                {loading ? (
                    <div className="flex justify-center items-center">
                        <FaSpinner size={30} className="animate-spin text-[#F4C2C2]" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-xl">{error}</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-2">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-xl text-gray-500">
                                No products found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
