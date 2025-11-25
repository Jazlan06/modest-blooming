import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successModal, setSuccessModal] = useState(false);
    const [showAccountDetails, setShowAccountDetails] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // ✅ Load user and token safely on client
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            setIsLoggedIn(!!token);
            setUser(userData ? JSON.parse(userData) : null);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            // Save token & user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            setSuccessModal(true);

            // Show modal for 2 seconds then switch UI to logged-in
            setTimeout(() => {
                setSuccessModal(false);
                setIsLoggedIn(true);

                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setEmail('');
        setPassword('');
        setError('');
    };

    return (
        <>
            <Head>
                {/* Page Title */}
                <title>Login | Modest Blooming</title>

                {/* Meta Description */}
                <meta
                    name="description"
                    content="Log in to your Modest Blooming account to manage orders, wishlist, and account settings. Secure login for customers."
                />

                {/* Robots - Prevent indexing for security */}
                <meta name="robots" content="noindex, nofollow" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://www.modestblooming.com/login" />

                {/* Open Graph / Social Media */}
                <meta property="og:title" content="Login | Modest Blooming" />
                <meta
                    property="og:description"
                    content="Access your Modest Blooming account to view orders, wishlist, and personal settings."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/login" />
                <meta property="og:image" content="https://www.modestblooming.com/logo.png" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Login | Modest Blooming" />
                <meta
                    name="twitter:description"
                    content="Access your Modest Blooming account to view orders, wishlist, and personal settings."
                />
                <meta name="twitter:image" content="https://www.modestblooming.com/logo.png" />
            </Head>
            <Navbar />
            <div className="min-h-screen mt-[3rem] bg-gradient-to-b from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] flex items-center justify-center px-4">
                <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 space-y-6 animate-fadeIn relative">
                    {successModal && (
                        <div className="absolute inset-0 bg-green-50 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-20 p-6">
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">Login Successful!</h3>
                            <p className="text-green-600">Welcome back, {user?.name || 'User'}.</p>
                        </div>
                    )}

                    {!isLoggedIn ? (
                        <>
                            <h2 className="text-3xl font-semibold text-gray-900 text-center font-serif tracking-wide leading-tight">
                                Welcome Back
                            </h2>
                            <p className="text-center text-gray-700 font-medium mb-6 font-serif tracking-wide">
                                Please login to your account
                            </p>

                            {error && (
                                <div className="text-red-600 text-center font-semibold mb-3 animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <label className="block">
                                    <span className="text-gray-700 font-semibold">Email</span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                        placeholder="you@example.com"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-gray-700 font-semibold">Password</span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 rounded-md shadow-md transition-opacity disabled:opacity-60"
                                >
                                    {loading ? 'Logging in...' : 'Log In'}
                                </button>
                                <p className="text-sm text-right">
                                    <a href="/forgot-password" className="text-[#8B3E5D] font-medium hover:underline">
                                        Forgot Password?
                                    </a>
                                </p>
                            </form>

                            <p className="text-center text-gray-700 font-medium mt-4">
                                Don&apos;t have an account?{' '}
                                <a
                                    href="/register"
                                    className="text-[#8B3E5D] hover:text-[#6B2B45] font-semibold underline transition-colors duration-300 ease-in-out"
                                >
                                    Sign up
                                </a>
                            </p>
                        </>
                    ) : (
                        <div className="space-y-8 font-serif max-w-md  mx-auto">
                            <h2 className="text-3xl font-semibold text-gray-900 text-center">
                                Welcome, <span className="text-[#8B3E5D]">{user?.name || 'User'}</span>!
                            </h2>

                            {/* Profile Sections */}
                            <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-200 overflow-hidden">
                                {/* Manage Account with dropdown */}
                                <div className="p-4 cursor-pointer transition hover:bg-gray-50" onClick={() => setShowAccountDetails(!showAccountDetails)}>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#8B3E5D]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5z" />
                                            </svg>
                                            Manage Account
                                        </h3>
                                        <span className="text-gray-500 text-xl">{showAccountDetails ? '−' : '+'}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">View and edit your personal address</p>

                                    {showAccountDetails && (
                                        <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
                                            <button
                                                onClick={() => router.push('/address')}
                                                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium flex items-center gap-2 transition"
                                            >
                                                <svg className="w-4 h-4 text-[#8B3E5D]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zM10 11a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                                Address
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3" onClick={() => router.push('/orders')}>
                                    <svg className="w-5 h-5 text-[#8B3E5D]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16 6V4H4v2h12zm0 4v-2H4v2h12zm0 4v-2H4v2h12z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">My Orders</h3>
                                        <p className="text-gray-600 text-sm">Check your order history</p>
                                    </div>
                                </div>

                                <div className="p-4 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3" onClick={() => router.push('/wishlist')}>
                                    <svg className="w-5 h-5 text-[#8B3E5D]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.343l-6.828-6.829a4 4 0 010-5.656z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Wishlist</h3>
                                        <p className="text-gray-600 text-sm">Your saved items</p>
                                    </div>
                                </div>

                                <div className="p-4 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3" onClick={() => router.push('/cart')}>
                                    <svg className="w-5 h-5 text-[#8B3E5D]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16 6H4l-1 2h14l-1-2zM4 10h12v6H4v-6z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Cart</h3>
                                        <p className="text-gray-600 text-sm">View your cart items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <div className="text-center">
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-opacity disabled:opacity-60"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                    <style jsx>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-8px); }
                        40%, 80% { transform: translateX(8px); }
                    }

                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease forwards;
                    }

                    .animate-shake {
                        animation: shake 0.4s ease;
                    }
                `}</style>
                </div>
            </div>
        </>
    );

}
