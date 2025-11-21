// ✅ FILE: frontend/components/common/HorizontalInfiniteCarousel.js

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

const HorizontalInfiniteCarousel = ({
    items = [],
    renderItem,
    scrollSpeed = 0.5,
    className = '',
    containerClass = '',
    showDots = true,
    isClickable = true
}) => {
    const scrollRef = useRef(null)
    const [userInteracted, setUserInteracted] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [itemsPerView, setItemsPerView] = useState(3)

    const totalItems = items.length

    // ✅ Dynamically adjust itemsPerView based on screen width
    useEffect(() => {
        const updateItemsPerView = () => {
            const width = window.innerWidth
            if (width >= 1536) setItemsPerView(6)
            else if (width >= 1280) setItemsPerView(5)
            else if (width >= 1024) setItemsPerView(4)
            else if (width >= 640) setItemsPerView(3)
            else setItemsPerView(2)
        }

        updateItemsPerView()
        window.addEventListener('resize', updateItemsPerView)
        return () => window.removeEventListener('resize', updateItemsPerView)
    }, [])

    // ✅ Auto scroll (pause on interaction)
    useEffect(() => {
        if (!scrollRef.current || userInteracted || totalItems === 0) return

        const container = scrollRef.current
        const itemEls = container.children
        if (!itemEls || itemEls.length === 0) return

        // ✅ Calculate exact width of one loop of items (first N items only)
        let loopWidth = 0
        for (let i = 0; i < totalItems; i++) {
            loopWidth += itemEls[i].offsetWidth + parseInt(getComputedStyle(itemEls[i]).marginRight)
        }

        let animationId

        const scroll = () => {
            if (!container) return

            container.scrollLeft += scrollSpeed

            // ✅ Reset when we've scrolled full loop
            if (container.scrollLeft >= loopWidth) {
                container.scrollLeft -= loopWidth
            }

            const index = Math.floor((container.scrollLeft % loopWidth) / (loopWidth / totalItems))
            setActiveIndex(index)

            animationId = requestAnimationFrame(scroll)
        }

        animationId = requestAnimationFrame(scroll)
        return () => cancelAnimationFrame(animationId)
    }, [userInteracted, totalItems, scrollSpeed])


    // ✅ Resume auto scroll 3s after user stops interaction
    useEffect(() => {
        if (!userInteracted) return
        const timeout = setTimeout(() => setUserInteracted(false), 3000)
        return () => clearTimeout(timeout)
    }, [userInteracted])

    // ✅ Allow dot click to jump to item
    const handleDotClick = (index) => {
        const container = scrollRef.current
        if (!container) return
        setUserInteracted(true)

        const fullScrollWidth = container.scrollWidth / 2
        const itemWidth = fullScrollWidth / totalItems

        container.scrollLeft = index * itemWidth
        setActiveIndex(index)
    }

    // ✅ Dots optimization: only show max 6 for UX
    const MAX_DOTS = 6
    const visibleDots = totalItems > MAX_DOTS ? MAX_DOTS : totalItems
    const dotStep = Math.floor(totalItems / visibleDots)

    // ✅ Setup interaction handlers
    const interactionEvents = {
        onMouseEnter: () => setUserInteracted(true),
        onMouseLeave: () => setUserInteracted(false),
        onTouchStart: () => setUserInteracted(true),
        onTouchEnd: () => setUserInteracted(false),
        onFocus: () => setUserInteracted(true),
        onBlur: () => setUserInteracted(false),
        onWheel: () => setUserInteracted(true),
        onMouseDown: () => setUserInteracted(true),
    }

    return (
        <div className={`space-y-4 ${containerClass}`}>
            {/* ✅ Scrollable container */}
            <div
                ref={scrollRef}
                className={`flex overflow-x-auto gap-3 hide-scrollbar scroll-smooth ${className}`}
                {...interactionEvents}
            >
                {[...items, ...items].map((item, idx) => (
                    <div
                        key={`${item._id}-${idx}`}
                        className="
        flex-shrink-0 
        w-[70%] sm:w-[45%] md:w-[30%] lg:w-[22%] xl:w-[18%] 2xl:w-[16%]
        transform transition duration-300 hover:scale-105 hover:shadow-md rounded
    "
                    >
                        <Link href={`/product/${item.slug || item._id}`}>
                            <div className="cursor-pointer">
                                {renderItem(item)}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* ✅ Dots - limited to max 6 */}
            {showDots && visibleDots > 0 && (
                <div className="flex justify-center gap-2">
                    {[...Array(visibleDots)].map((_, i) => {
                        const index = i * dotStep
                        return (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-black scale-110' : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to item ${index + 1}`}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default HorizontalInfiniteCarousel