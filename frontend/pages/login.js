import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successModal, setSuccessModal] = useState(false);
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
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] flex items-center justify-center px-4">
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
                        <div className="text-center font-serif tracking-wide space-y-6">
                            <h2 className="text-3xl font-semibold text-gray-900">
                                Welcome, <span className="text-[#8B3E5D]">{user?.name || 'User'}</span>!
                            </h2>
                            <button
                                onClick={handleLogout}
                                className="bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 px-8 rounded-md shadow-md transition-opacity disabled:opacity-60"
                            >
                                Logout
                            </button>
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
