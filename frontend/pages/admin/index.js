import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = loading state
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.replace('/');
            return;
        }

        const parsedUser = JSON.parse(user);

        if (parsedUser.role !== 'admin') {
            router.replace('/');
        } else {
            setIsAuthorized(true);
        }
    }, []);

    // 🧠 While checking or redirecting, show loading
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                Redirecting...
            </div>
        );
    }

    // ✅ Authorized user, render the page content
    return (
        <div className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {/* Your admin content here */}
        </div>
    );
}
