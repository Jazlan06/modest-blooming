import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import emailSentImg from '../public/logo.png';
import Head from 'next/head';
export default function VerifyEmail() {
    const [modal, setModal] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
        showInput: false,
        onSubmit: null,
    });

    const handleResendClick = () => {
        setModal({
            show: true,
            title: 'Resend Verification',
            message: 'Enter your registered email:',
            type: 'info',
            showInput: true,
            onSubmit: handleResend,
        });
    };

    const handleResend = async (email) => {
        if (!email || !email.includes('@')) {
            setModal({
                show: true,
                title: 'Invalid Email',
                message: 'Please enter a valid email address.',
                type: 'error',
            });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Request failed');

            setModal({
                show: true,
                title: 'Success 🎉',
                message: 'Verification email sent successfully!',
                type: 'success',
            });
        } catch (err) {
            setModal({
                show: true,
                title: 'Error ❌',
                message: err.message || 'Something went wrong.',
                type: 'error',
            });
        }
    };

    return (
        <>
            <Head>
                <title>Verify Your Email | Modest Blooming</title>
                <meta
                    name="description"
                    content="Complete your registration at Modest Blooming by verifying your email. Check your inbox for the verification link and confirm your account to start shopping for hijabs, scarves, and modest fashion."
                />
                <meta
                    name="keywords"
                    content="verify email, email verification, account verification, Modest Blooming, hijabs, scarves, modest fashion, online shopping, secure registration"
                />
                <meta property="og:title" content="Verify Your Email | Modest Blooming" />
                <meta
                    property="og:description"
                    content="Complete your registration by verifying your email with Modest Blooming. Start shopping hijabs, scarves, and modest fashion after email confirmation."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.modestblooming.com/verify-email" />
                <meta property="og:image" content="https://www.modestblooming.com/og-image-verify-email.jpg" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://www.modestblooming.com/verify-email" />
            </Head>
            <Navbar />
            <div className="min-h-screen mt-3 flex items-center justify-center bg-gradient-to-br from-[#fdf7f7] via-[#fae5e5] to-[#fdf7f7] px-4">
                <div className="max-w-md w-full bg-biege rounded-xl shadow-lg p-8 text-center transition-all duration-300">

                    <div className="w-full flex justify-center">
                        <Image
                            src={emailSentImg}
                            alt="Email sent"
                            width={250}
                            height={120}
                            className="rounded-full object-contain"
                            priority
                        />
                    </div>

                    <h2 className="text-2xl font-semibold text-[#D48C8C] mb-2">
                        Verify your email 📧
                    </h2>
                    <p className="text-gray-600 mb-6">
                        We’ve sent a verification link to your email address.
                        Please check your inbox and click the link to complete registration.
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                        Didn’t receive the email? Check your spam folder or{' '}
                        <span
                            className="text-[#D48C8C] underline cursor-pointer"
                            onClick={handleResendClick}
                        >
                            resend verification
                        </span>
                    </p>

                    <Link href="/login">
                        <span className="text-[#D48C8C] font-medium hover:underline cursor-pointer">
                            Back to Login
                        </span>
                    </Link>
                </div>
            </div>

            {/* Modal */}
            <Modal
                show={modal.show}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                showInput={modal.showInput}
                onSubmit={modal.onSubmit}
                onClose={() => setModal({ ...modal, show: false })}
            />
        </>
    );
}
