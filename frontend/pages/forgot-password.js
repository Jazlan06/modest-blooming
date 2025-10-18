// pages/forgot-password.js
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong');

            setMessage(data.message || 'Password reset email sent successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] px-4">
                <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 space-y-6 animate-fadeIn relative">
                    <h2 className="text-3xl font-bold text-gray-900 text-center font-serif">Forgot Password?</h2>
                    <p className="text-center text-gray-600">Enter your email and we’ll send you a reset link.</p>

                    {message && <div className="text-green-600 font-semibold text-center">{message}</div>}
                    {error && <div className="text-red-600 font-semibold text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <label className="block">
                            <span className="text-gray-700 font-semibold">Email Address</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#8B3E5D] focus:ring-[#8B3E5D]"
                                placeholder="you@example.com"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 rounded-md shadow-md transition disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}