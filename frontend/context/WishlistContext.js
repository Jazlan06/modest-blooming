import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    const fetchWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5000/api/user/my', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data?.wishlist && Array.isArray(data.wishlist)) {
                // ✅ Keep full product objects if populated, fallback to {_id: id}
                const formattedWishlist = data.wishlist.map(item =>
                    typeof item === 'string' ? { _id: item } : item
                );
                setWishlist(formattedWishlist);
            } else {
                setWishlist([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlist([]);
        }
    };

    const toggleWishlist = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to use wishlist');
            return;
        }

        const isInWishlist = wishlist.some(p => p._id === productId);
        const method = isInWishlist ? 'DELETE' : 'POST';
        const url = `http://localhost:5000/api/user/wishlist/${productId}`;

        try {
            await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                ...(method === 'POST' ? { body: JSON.stringify({ productId }) } : {}),
            });

            // ✅ Re-fetch wishlist to ensure full product details
            await fetchWishlist();

        } catch (err) {
            console.error('Error updating wishlist:', err);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);