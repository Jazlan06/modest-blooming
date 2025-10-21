// components/homepage/NewArrivalsSection.js
import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/solid'

const NewArrivalsSection = ({ products }) => {
  const now = new Date()
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

  const recentProducts = products
    .filter(product => {
      const createdAt = new Date(product.createdAt)
      return now - createdAt <= THIRTY_DAYS_MS
    })
    .slice(0, 4) // ✅ Limit to 4 new arrivals

  if (recentProducts.length === 0) return null

  return (
    <section className="py-20 px-2 sm:px-4 md:px-4 bg-white font-body">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-semibold text-gray-800 tracking-tight font-display">
            New Arrivals
          </h2>
          <Link href="/new-arrivals" passHref>
            <div className="flex items-center gap-2 text-black hover:text-pink-700 font-semibold transition-colors cursor-pointer group text-base">
              <span className="font-body">View All</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid  grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
          {recentProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-100 rounded-lg shadow-sm transition duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={`/product/${product.slug || product._id}`} passHref>
                <div className="cursor-pointer flex flex-col">
                  <img
                    src={product.media?.[0]} 
                    alt={product.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover object-center rounded-t-lg"
                    loading="lazy"
                  />
                  <div className="px-4 py-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate font-display">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 font-body">
                      ₹{product.price}
                    </p>
                    <button className="mt-4 bg-[#F4C2C2] text-white font-semibold py-2 rounded hover:bg-pink-300 transition-colors text-sm font-body">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewArrivalsSection
