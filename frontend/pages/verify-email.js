import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import emailSentImg from '../public/logo.png'; 
export default function VerifyEmail() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen mt-3 flex items-center justify-center bg-gradient-to-br from-[#fdf7f7] via-[#fae5e5] to-[#fdf7f7] px-4">
                <div className="max-w-md w-full bg-biege rounded-xl shadow-lg p-8 text-center transition-all duration-300">
                    
                    {/* Logo Image */}
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
                        <span className="text-[#D48C8C] underline cursor-pointer">
                            resend verification
                        </span>{' '}
                        (coming soon).
                    </p>

                    <Link href="/login">
                        <span className="text-[#D48C8C] font-medium hover:underline cursor-pointer">
                            Back to Login
                        </span>
                    </Link>
                </div>
            </div>
        </>
    );
}
