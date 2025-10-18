// pages/index.js
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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
    brandBanner,
    bestSellerBanner,
    saleBanner,
    announcements = [],
    newArrivals = [],
    featuredProducts = [],
    newArrivalsSection = {},
    seo = {}
  } = content

  const pageTitle = seo.title || 'Welcome to Our Store'
  const pageDescription = seo.description || 'Discover trending products, exclusive deals, and new arrivals curated for you.'
  const pageKeywords = seo.keywords || 'ecommerce, shopping, fashion, new arrivals, best sellers'

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

      <main className="pt-24 space-y-16">

        {/* Hero Banners */}
        {heroBanners.length > 0 && (
          <section className="w-full">
            {heroBanners.map((banner, idx) => (
              <div key={idx} className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
                <Image
                  src={banner.image}
                  alt={banner.altText || `Hero Banner ${idx + 1}`}
                  layout="fill"
                  objectFit="contain"
                  priority={idx === 0}
                />
                <div className={`absolute inset-0 flex flex-col justify-center items-center text-center px-4 text-${banner.textColor || 'white'}`}>
                  <h1 className="text-3xl md:text-5xl font-bold">{banner.title}</h1>
                  <p className="text-lg mt-2">{banner.subtitle}</p>
                  {banner.buttonText && (
                    <Link href={banner.buttonLink || '#'}>
                      <span className="mt-4 inline-block bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer">
                        {banner.buttonText}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Brand Banner */}
        {brandBanner?.image && (
          <section className="px-0 sm:px-4">
            <div className="relative w-full h-72 sm:h-96 lg:h-[400px]">
              <Image
                src={brandBanner.image}
                alt={brandBanner.altText || 'Brand Banner'}
                layout="fill"
                objectFit="contain"
              />
              <div className="absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center text-center px-4">
                <h2 className="text-4xl font-bold text-white">{brandBanner.title}</h2>
                {brandBanner.buttonText && (
                  <Link href={brandBanner.buttonLink || '#'}>
                    <span className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer">
                      {brandBanner.buttonText}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Best Seller Banner */}
        {bestSellerBanner?.image && (
          <section className="px-0 sm:px-4">
            <div className="relative w-full h-72 sm:h-96 lg:h-[400px]">
              <Image
                src={bestSellerBanner.image}
                alt={bestSellerBanner.altText || 'Best Seller Banner'}
                layout="fill"
                objectFit="contain"
              />
              <div className="absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center px-4">
                <h2 className="text-3xl font-semibold text-white">{bestSellerBanner.title}</h2>
                {bestSellerBanner.buttonText && (
                  <Link href={bestSellerBanner.buttonLink || '#'}>
                    <span className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer">
                      {bestSellerBanner.buttonText}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Sale Banner */}
        {saleBanner?.isActive && saleBanner?.image && (
          <section className="px-0 sm:px-4">
            <div className="relative w-full h-60 sm:h-72 lg:h-80">
              <Image
                src={saleBanner.image}
                alt={saleBanner.altText || 'Sale Banner'}
                layout="fill"
                objectFit="contain"
              />
              <div className="absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center px-4">
                <h2 className="text-2xl font-bold text-white">{saleBanner.title}</h2>
                {saleBanner.buttonText && (
                  <Link href={saleBanner.buttonLink || '#'}>
                    <span className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer">
                      {saleBanner.buttonText}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

                {/* Announcements */}
        {announcements.length > 0 && (
          <section className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((a, i) => (
                <div
                  key={i}
                  className="rounded p-4 text-center"
                  style={{
                    backgroundColor: a.backgroundColor || '#fefefe',
                    color: a.textColor || '#000',
                    animation: a.animation || 'none'
                  }}
                >
                  {a.image && (
                    <img
                      src={a.image}
                      alt={`Announcement ${i + 1}`}
                      className="mx-auto mb-2 max-h-24"
                      loading="lazy"
                    />
                  )}
                  <p>{a.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section
            style={{ background: newArrivalsSection.background || '#fff' }}
            className="py-12 px-4"
          >
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold" style={{ color: newArrivalsSection.textColor }}>
                {newArrivalsSection.heading || 'New Arrivals'}
              </h2>
              {newArrivalsSection.subheading && (
                <p className="text-lg mt-2" style={{ color: newArrivalsSection.textColor }}>
                  {newArrivalsSection.subheading}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
                {newArrivals.map((product) => (
                  <div key={product._id} className="bg-white shadow rounded p-4">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-48 object-contain w-full rounded"
                      loading="lazy"
                    />
                    <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                    <p className="text-pink-700 font-bold">₹{product.price}</p>
                  </div>
                ))}
              </div>
              {newArrivalsSection.buttonText && (
                <Link href={newArrivalsSection.buttonLink || '/shop'}>
                  <span className="mt-6 inline-block bg-pink-500 text-white px-5 py-2 rounded hover:bg-pink-600 transition cursor-pointer">
                    {newArrivalsSection.buttonText}
                  </span>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-12 bg-gray-50 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="bg-white shadow rounded p-4">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-48 object-contain w-full rounded"
                      loading="lazy"
                    />
                    <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                    <p className="text-pink-700 font-bold">₹{product.price}</p>
                  </div>
                ))}
              </div>
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