// pages/reset-password/[token].js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Reset failed');

            setSuccess(data.message || 'Password has been reset successfully.');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Reset Password | Modest Blooming</title>
                <meta name="description" content="Reset your account password securely on Modest Blooming." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] px-4">
                <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 space-y-6 animate-fadeIn">
                    <h2 className="text-3xl font-bold text-gray-900 text-center font-serif">Reset Your Password</h2>

                    {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
                    {error && <div className="text-red-600 font-semibold text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <label className="block">
                            <span className="text-gray-700 font-semibold">New Password</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#8B3E5D] focus:ring-[#8B3E5D]"
                                placeholder="••••••••"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-semibold">Confirm Password</span>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#8B3E5D] focus:ring-[#8B3E5D]"
                                placeholder="••••••••"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 rounded-md shadow-md transition disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
ResetPasswordPage.isPrivate = true;