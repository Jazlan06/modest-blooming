// utils/withAdminAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function withAdminAuth(WrappedComponent) {
    return function ProtectedComponent(props) {
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');

                if (!token || !userData) {
                    router.replace('/'); // Redirect if not logged in
                    return;
                }

                try {
                    const user = JSON.parse(userData);
                    if (user.role === 'admin') {
                        setIsAuthorized(true); // Allow access
                    } else {
                        router.replace('/'); // Redirect non-admins
                    }
                } catch (err) {
                    console.error('Failed to parse user data:', err);
                    router.replace('/');
                }
            }
        }, []);

        if (!isAuthorized) {
            return null; // Prevent rendering until authorized
        }

        return (
            <>
                <Head>
                    <meta name="robots" content="noindex, nofollow" />
                </Head>
                <WrappedComponent {...props} />
            </>
        );
    };
}