import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successModal, setSuccessModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setSuccessModal(true);

            setTimeout(() => {
                setSuccessModal(false);
                router.push('/verify-email');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] flex items-center justify-center px-4">
                <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 space-y-6 animate-fadeIn relative">
                    {successModal && (
                        <div className="absolute inset-0 bg-green-50 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-20 p-6">
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">Registration Successful!</h3>
                            <p className="text-green-600">Please check your email to verify your account.</p>
                        </div>
                    )}

                    <h2 className="text-3xl font-semibold text-gray-900 text-center font-serif tracking-wide leading-tight">
                        Create Account
                    </h2>
                    <p className="text-center text-gray-700 font-medium mb-6 font-serif tracking-wide">
                        Fill in the details to register
                    </p>

                    {error && (
                        <div className="text-red-600 text-center font-semibold mb-3 animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <label className="block">
                            <span className="text-gray-700 font-semibold">Name</span>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                placeholder="Your full name"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-semibold">Email</span>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                placeholder="you@example.com"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-semibold">Phone</span>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                placeholder="1234567890"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-semibold">Password</span>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-[#8B3E5D] focus:ring focus:ring-[#8B3E5D] focus:ring-opacity-50 transition"
                                placeholder="••••••••"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 rounded-md shadow-md transition-opacity disabled:opacity-60"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-center text-gray-700 font-medium mt-4">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-[#8B3E5D] hover:text-[#6B2B45] font-semibold underline transition-colors duration-300 ease-in-out"
                        >
                            Log in
                        </a>
                    </p>

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
                            0%,
                            100% {
                                transform: translateX(0);
                            }
                            20%,
                            60% {
                                transform: translateX(-8px);
                            }
                            40%,
                            80% {
                                transform: translateX(8px);
                            }
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