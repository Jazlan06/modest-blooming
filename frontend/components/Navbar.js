import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaBars, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const inputRef = useRef(null);
    const { wishlist } = useWishlist();
    const router = useRouter();
    const { pathname } = router;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            setIsLoggedIn(!!token);

            if (userData) {
                const parsedUser = JSON.parse(userData);
                setRole(parsedUser.role || null); // ✅ set role
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        setIsLoggedIn(!!token);

        if (userData) {
            const parsedUser = JSON.parse(userData);
            setRole(parsedUser.role || null);
        }

        // Fetch wishlist count if logged in
        if (token) {
            const fetchWishlistCount = async () => {
                try {
                    const res = await fetch('http://localhost:5000/api/user/my', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await res.json();
                    if (data?.wishlist && Array.isArray(data.wishlist)) {
                        setWishlistCount(data.wishlist.length);
                    } else {
                        setWishlistCount(0);
                    }
                } catch (err) {
                    console.error("Failed to fetch wishlist:", err);
                    setWishlistCount(0);
                }
            };

            fetchWishlistCount();
        }
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    };

    const handleProfileClick = () => {
        if (isLoggedIn) {
            router.push('/login');
        } else {
            router.push('/register');
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F4C2C2] text-white px-4 shadow-md h-20 md:h-24">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 relative">

                    {/* === Mobile Left Icons === */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="focus:outline-none focus:ring-0">
                            <FaBars size={22} />
                        </button>
                        <button onClick={() => setSearchOpen(!searchOpen)} className="focus:outline-none focus:ring-0 ml-2">
                            <FaSearch size={20} />
                        </button>
                    </div>

                    {/* === Mobile Logo === */}
                    <div className="flex justify-center md:justify-start flex-1 md:flex-none">
                        <Link href="/" className="block w-[150px] md:w-[170px] focus:outline-none focus:ring-0">
                            <Image
                                src="/logo.png"
                                alt="Modest Blooming Logo"
                                width={165}
                                height={50}
                                priority
                            />
                        </Link>
                    </div>

                    {/* === Desktop Navbar === */}
                    <div className="hidden md:flex items-center bg-[#F4C2C2] h-24 px-4 fixed top-0 left-0 right-0 z-50">
                        {/* Logo */}
                        <div className="flex-shrink-0 w-[170px]">
                            <Link href="/" className="block focus:outline-none focus:ring-0">
                                <Image
                                    src="/logo.png"
                                    alt="Modest Blooming Logo"
                                    width={165}
                                    height={50}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative w-[450px] mx-6 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 pr-10 py-2 rounded-full text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#F4C2C2]"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F4C2C2] hover:text-pink-700 focus:outline-none">
                                <FaSearch size={20} />
                            </button>
                        </form>

                        {/* Nav Links */}
                        <div className="flex ml-[100px] items-center gap-8 text-lg font-medium mr-6">
                            <Link href="/" className="hover:underline focus:outline-none focus:ring-0">Home</Link>
                            <Link href="/shop" className="hover:underline focus:outline-none focus:ring-0">Shop</Link>
                            <Link href="/about" className="hover:underline focus:outline-none focus:ring-0">About</Link>
                            <Link href="/contact" className="hover:underline focus:outline-none focus:ring-0">Contact</Link>

                            {role === 'admin' && (
                                <>
                                    <Link href="/admin" className="hover:underline focus:outline-none focus:ring-0 text-yellow-200">Admin</Link>
                                    <Link href="/admin/analytics" className="hover:underline focus:outline-none focus:ring-0 text-yellow-200">Analytics</Link>
                                </>
                            )}
                        </div>

                        {/* Desktop Icons */}
                        <div className="flex items-center gap-6 ml-auto">
                            {/* Wishlist Icon with Badge */}
                            <div className="relative">
                                <FaHeart size={26} className="cursor-pointer" />
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-[#F4C2C2] text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                        {wishlist.length}
                                    </span>
                                )}
                            </div>
                            <FaShoppingCart size={26} className="cursor-pointer" />
                            <FaUserCircle
                                size={28}
                                className="cursor-pointer text-white hover:text-gray-200"
                                onClick={handleProfileClick}
                                title={isLoggedIn ? 'Logout' : 'Register'}
                            />
                        </div>
                    </div>

                    {/* === Mobile Right Icons (no profile here) === */}
                    <div className="flex items-center gap-4 md:hidden">
                        {/* Mobile Wishlist Icon with Badge */}
                        <div className="relative">
                            <FaHeart size={22} className="cursor-pointer" />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-white text-[#F4C2C2] text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                    {wishlist.length}
                                </span>
                            )}
                        </div>
                        <FaShoppingCart size={22} className="cursor-pointer ml-[5px]" />
                    </div>
                </div>
            </nav>

            {/* === Mobile Search Overlay === */}
            {searchOpen && (
                <div className="fixed top-20 md:hidden left-0 right-0 z-40 bg-white shadow-md py-4 px-6 flex items-center gap-4 transition-all duration-300">
                    <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search Products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] text-black"
                        />
                        <button type="submit" className="bg-[#F4C2C2] text-white px-4 py-2 rounded-md hover:bg-[#f7b0b0] transition-colors focus:outline-none focus:ring-0">
                            Search
                        </button>
                        <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-600 hover:text-black focus:outline-none focus:ring-0">
                            <FaTimes size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* === Mobile Sidebar Menu === */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <aside className="relative bg-white w-72 max-w-full h-full p-8 shadow-2xl rounded-tr-lg rounded-br-lg animate-slide-in-left flex flex-col"
                        style={{ animationDuration: '300ms', animationTimingFunction: 'ease-out' }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close menu"
                            className="self-end mb-6 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4C2C2] rounded"
                        >
                            <FaTimes size={24} />
                        </button>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-6 text-lg font-semibold text-gray-800">
                            {[{ href: '/', label: 'Home' },
                            { href: '/shop', label: 'Shop' },
                            { href: '/about', label: 'About' },
                            { href: '/contact', label: 'Contact' },
                            ...(role === 'admin'
                                ? [
                                    { href: '/admin', label: 'Admin' },
                                    { href: '/admin/analytics', label: 'Analytics' },
                                ]
                                : [])
                            ].map(({ href, label }) => {
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] rounded 
                    ${isActive
                                                ? 'text-[#F4C2C2]'
                                                : 'text-black hover:underline hover:decoration-[#F4C2C2]'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Profile Icon at Bottom */}
                        <div className="mt-auto pt-8 border-t border-gray-200 flex justify-center">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleProfileClick();
                                }}
                                className="text-[#8B3E5D] flex flex-col items-center hover:text-[#6B2B45] focus:outline-none"
                            >
                                <FaUserCircle size={28} />
                                <span className="text-sm mt-1">
                                    {isLoggedIn ? 'Logout' : 'Login'}
                                </span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
