import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

export default function EmailVerificationPage() {
    const router = useRouter();
    const { token } = router.query;
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) return;

        const verifyEmail = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email/${token}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Verification failed');

                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Something went wrong.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <>
            <Head>
                <title>Email Verification | Modest Blooming</title>
                <meta name="description" content="Verify your Modest Blooming account email securely. Complete your registration to start shopping." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F4C2C2] via-[#F9E4E4] to-[#FFEDED] px-4">
                <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 text-center font-serif tracking-wide animate-fadeIn">
                    {status === 'loading' && (
                        <h2 className="text-2xl text-gray-800 font-semibold">Verifying email...</h2>
                    )}

                    {status === 'success' && (
                        <>
                            <h2 className="text-2xl text-green-700 font-bold mb-4">✅ Email Verified!</h2>
                            <p className="text-gray-700 mb-6">{message}</p>
                            <a
                                href="/login"
                                className="bg-[#8B3E5D] hover:bg-[#6B2B45] text-white font-bold py-3 px-6 rounded-md shadow-md inline-block transition-opacity"
                            >
                                Go to Login
                            </a>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h2 className="text-2xl text-red-600 font-bold mb-4">❌ Verification Failed</h2>
                            <p className="text-gray-700 mb-6">{message}</p>
                            <a
                                href="/"
                                className="text-[#8B3E5D] hover:text-[#6B2B45] underline font-semibold"
                            >
                                Return Home
                            </a>
                        </>
                    )}
                </div>

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

                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease forwards;
                    }
                `}</style>
            </div>
        </>
    );
}
EmailVerificationPage.isPrivate = true;