// pages/index.js
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar'
import NewArrivalsSection from '@/components/homepage/NewArrivalsSection'
import HorizontalInfiniteCarousel from '@/components/common/HorizontalInfiniteCarousel'

export default function HomePage({ content }) {
    if (!content) {
        return (
            <main className="min-h-screen flex items-center justify-center" role="alert" aria-live="polite">
                <p>Failed to load homepage content.</p>
            </main>
        )
    }

    const {
        heroBanners = [],
        bestSellerBanner,
        saleBanner,
        announcements = [],
        newArrivals = [],
        featuredProducts = [],
        seo = {}
    } = content

    const pageTitle = seo.title || 'Welcome to Our Store'
    const pageDescription = seo.description || 'Discover trending products, exclusive deals, and new arrivals curated for you.'
    const pageKeywords = seo.keywords || 'ecommerce, shopping, fashion, new arrivals, best sellers'

    // --- Hero Banner Carousel Logic ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef(null);
    const delay = 3000;

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [uniqueCategories, setUniqueCategories] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
                const data = await res.json();
                setAllProducts(data || []);

                // 👉 Compute unique categories based on fetched data
                const uniqueCategoryMap = new Map();

                data.forEach((product) => {
                    const category = product.category;
                    if (!uniqueCategoryMap.has(category) && product.media?.[0]) {
                        uniqueCategoryMap.set(category, {
                            name: category,
                            image: product.media[0]
                        });
                    }
                });

                const uniqueCategoryArray = Array.from(uniqueCategoryMap.values());
                setUniqueCategories(uniqueCategoryArray); // ✅ Update state
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
        localStorage.setItem("sessionId", sessionId);

        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/log-visit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ sessionId }),
        });
    }, []);


    useEffect(() => {
        if (!isPaused && heroBanners.length > 1) {
            resetTimeout();
            timeoutRef.current = setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
            }, delay);
        }
        return () => resetTimeout();
    }, [currentSlide, isPaused, heroBanners.length]);

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={pageKeywords} />
                <meta name="robots" content="index, follow" />
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                {heroBanners[0]?.image && <meta property="og:image" content={heroBanners[0].image} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                {heroBanners[0]?.image && <meta name="twitter:image" content={heroBanners[0].image} />}
            </Head>

            <Navbar />

            <main className="pt-24 sm:pt-30 md:pt-[7rem] space-y-16r">

                {/* 🔄 Hero Banners - Fade Carousel */}
                {heroBanners.length > 0 && (
                    <section
                        className="relative mb-[5rem] w-full h-[450px] sm:h-[550px] lg:h-[680px] overflow-hidden"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {heroBanners.map((banner, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            >
                                <Image
                                    src={banner.image}
                                    alt={banner.altText || `Hero Banner ${idx + 1}`}
                                    layout="fill"
                                    objectFit="fill"
                                    priority={idx === 0}
                                />

                                {/* Banner Text */}
                                <div
                                    className={`absolute bottom-3 sm:py-10 md:py-18 left-3 sm:left-7 right-3 sm:right-7
                        text-sm sm:text-lg md:text-lg 
                        max-w-[calc(100%-13rem)] sm:max-w-[calc(100%-30rem)] lg:max-w-[calc(100%-55rem)]
                        flex flex-col gap-4`}
                                    style={{
                                        color: banner.textColor || '#fff',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.4',
                                    }}
                                >
                                    <h1 className="break-words font-bold font-serif text-[1.4rem] sm:text-[2rem] lg:text-[2.5rem] leading-snug">
                                        {banner.title}
                                    </h1>

                                    {banner.subtitle && (
                                        <p className="text-[1.1rem] sm:text-base md:text-[1.5rem] pb-[1rem] font-bold font-heading">
                                            {banner.subtitle}
                                        </p>
                                    )}

                                    {banner.buttonText && (
                                        <Link href={banner.buttonLink || '#'}>
                                            <span className="inline-block w-fit bg-white text-black text-sm sm:text-base px-3 py-2 sm:px-5 rounded transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer font-display">
                                                {banner.buttonText}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* ⭕ Navigation Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                            {heroBanners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`w-3 h-3 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-gray-400'
                                        } transition`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 🏆 Best Seller Banner (styled like Sale Banner) */}
                {bestSellerBanner?.image && (
                    <section className="py-4 px-2 sm:px-2 sm:py-12 lg:py-20">
                        <div className="max-w-7xl mx-auto grid gap-4 grid-cols-1">
                            <div
                                className="relative overflow-hidden rounded text-left group transition-transform duration-500 ease-in-out"
                                style={{
                                    color: bestSellerBanner.textColor || '#000',
                                }}
                            >
                                <img
                                    src={bestSellerBanner.image}
                                    alt={bestSellerBanner.altText || 'Best Seller Banner'}
                                    className="w-full h-auto sm:h-[33rem] lg:h-[35rem] object-fill transform transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />

                                <div
                                    className={`
                        absolute bottom-3 pb-[1.7rem] pl-[0.5rem] sm:py-10 md:pb-[4rem] left-3 sm:left-7 right-3 sm:right-7
                        text-sm sm:text-lg md:text-lg 
                        max-w-[calc(100%-15rem)] sm:max-w-[calc(100%-30rem)] lg:max-w-[calc(100%-55rem)]
                        flex flex-col gap-4
                    `}
                                    style={{
                                        color: bestSellerBanner.textColor || '#000',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.4',
                                    }}
                                >
                                    <h2 className="break-words font-bold font-serif text-[1.4rem] sm:text-[2rem] lg:text-[2.5rem] leading-snug">
                                        {bestSellerBanner.title}
                                    </h2>

                                    {bestSellerBanner.buttonText && (
                                        <Link href={bestSellerBanner.buttonLink || '#'}>
                                            <span className="inline-block w-fit bg-white text-black text-sm sm:text-base px-3 py-2 sm:px-5 rounded transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer font-display">
                                                {bestSellerBanner.buttonText}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <NewArrivalsSection products={newArrivals} />

                {/* Sale Banner */}
                {saleBanner?.isActive && saleBanner?.image && (
                    <section className="py-4 px-2 sm:px-2 sm:py-12 lg:py-20">
                        <div className="max-w-7xl mx-auto grid gap-4 grid-cols-1">
                            <div
                                className="relative overflow-hidden rounded text-left group transition-transform duration-500 ease-in-out"
                                style={{
                                    color: saleBanner.textColor || '#000',
                                }}
                            >
                                <img
                                    src={saleBanner.image}
                                    alt={saleBanner.altText || 'Sale Banner'}
                                    className="w-full h-auto lg:h-[35rem] object-fill transform transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />

                                <div
                                    className={`
                        absolute bottom-3 sm:py-10 md:py-18 left-3 sm:left-7 right-3 sm:right-7
                        text-sm sm:text-lg md:text-lg 
                        max-w-[calc(100%-15rem)] sm:max-w-[calc(100%-30rem)] lg:max-w-[calc(100%-55rem)]
                        flex flex-col gap-4
                    `}
                                    style={{
                                        color: saleBanner.textColor || '#000',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.4',
                                    }}
                                >
                                    <h2 className="break-words font-bold font-serif text-[1.4rem] sm:text-[2rem] lg:text-[2.5rem] leading-snug">
                                        {saleBanner.title}
                                    </h2>

                                    {saleBanner.buttonText && (
                                        <Link href={saleBanner.buttonLink || '#'}>
                                            <span className="inline-block w-fit bg-white text-black text-sm sm:text-base px-3 py-2 sm:px-5 rounded transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer font-display">
                                                {saleBanner.buttonText}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Announcements */}
                {announcements.length > 0 && (
                    <section className="py-4 px-2 sm:px-2 sm:py-12 lg:py-20">
                        <div className="max-w-7xl mx-auto grid gap-4 grid-cols-1">
                            {announcements.map((a, i) => (
                                <div
                                    key={i}
                                    className={`relative overflow-hidden rounded text-left ${a.animation || ''}`}
                                    style={{
                                        backgroundColor: a.backgroundColor || '#fefefe',
                                        color: a.textColor || '#000',
                                    }}
                                >
                                    {a.image && (
                                        <img
                                            src={a.image}
                                            alt={`Announcement ${i + 1}`}
                                            className="w-full h-auto lg:h-[35rem] lg:w-full object-fill"
                                            loading="lazy"
                                        />
                                    )}
                                    <div
                                        className={`
              absolute bottom-3 sm:bottom-35 md:bottom-40 left-3 sm:left-7 right-3 sm:right-7
              text-sm sm:text-lg md:text-lg 
              max-w-[calc(100%-15rem)] sm:max-w-[calc(100%-30rem)] lg:max-w-[calc(100%-55rem)]
            `}
                                        style={{
                                            color: a.textColor || '#000',
                                            wordWrap: 'break-word',
                                            lineHeight: '1.4',
                                        }}
                                    >
                                        <p className="break-words font-semi-bold font-serif text-[1.2rem] sm:text-[1.5rem] lg:text-[2rem]">
                                            {a.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Products */}
                {featuredProducts.length > 0 && (
                    <section className="py-11 bg-gradient-to-b from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] px-1 md:px-7">
                        <div className="max-w-7xl mx-auto text-center">
                            <h2 className="text-3xl font-bold font-display mb-8">Featured Products</h2>

                            {/* 👇 Mobile Infinite Carousel with dots */}
                            <div className="md:hidden">
                                <HorizontalInfiniteCarousel
                                    items={featuredProducts}
                                    itemsPerView={3}
                                    scrollSpeed={0.5}
                                    showDots={true}
                                    renderItem={(product) => (
                                        <div className="bg-white shadow rounded pb-3">
                                            <img
                                                src={product.media?.[0]}
                                                alt={product.name}
                                                className="h-48 object-fill w-full rounded"
                                                loading="lazy"
                                            />
                                            <h3 className="text-lg text-left ml-2 font-semibold font-display mt-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-pink-700 text-left ml-3 font-semi-bold font-body">
                                                ₹{product.price}
                                            </p>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* 👇 Desktop Grid layout */}
                            <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {featuredProducts.map((product) => (
                                    <Link
                                        key={product._id}
                                        href={`/product/${product.slug || product._id}`}
                                        passHref
                                    >
                                        <div className="bg-white shadow rounded p-0 pb-3 transform transition duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
                                            <img
                                                src={product.media?.[0]}
                                                alt={product.name}
                                                className="h-48 md:h-64 object-fill w-full rounded-t"
                                                loading="lazy"
                                            />
                                            <h3 className="text-lg text-left ml-2 font-semibold font-display mt-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-pink-700 text-left ml-3 font-semi-bold font-body">
                                                ₹{product.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        </div>
                    </section>
                )}

                {/* 🗂️ Shop by Category - infinite scroll on all screen sizes */}
                {!loadingProducts && uniqueCategories.length > 0 && (
                    <section className="py-12 px-2 md:px-6 bg-gradient-to-b from-[#ffecec] via-[#fff5f5] to-[#ffffff]">
                        <div className="max-w-7xl mx-auto text-center">
                            <h2 className="text-3xl font-bold font-display mb-10">Categories</h2>

                            <HorizontalInfiniteCarousel
                                items={uniqueCategories}
                                scrollSpeed={0.5}
                                showDots={true}
                                renderItem={(cat) => (
                                    <Link
                                        href={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        passHref
                                    >
                                        <div className="group bg-white shadow-md rounded overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-52 object-fill"
                                                loading="lazy"
                                            />
                                            <div className="py-3 text-center">
                                                <h3 className="text-lg font-semibold font-display">{cat.name}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            />
                        </div>
                    </section>
                )}




            </main>
        </>
    )
}

export async function getServerSideProps() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const resp = await fetch(`${baseUrl}/api/cms/homepage`)
        if (!resp.ok) {
            console.error('Failed to fetch homepage:', resp.status, resp.statusText)
            return { props: { content: null } }
        }
        const content = await resp.json()
        return { props: { content } }
    } catch (err) {
        console.error('Error in getServerSideProps:', err)
        return { props: { content: null } }
    }
}