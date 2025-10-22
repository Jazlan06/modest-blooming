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
                setWishlist(data.wishlist.map(item => item._id || item));
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

        const isInWishlist = wishlist.includes(productId);
        const method = isInWishlist ? 'DELETE' : 'POST';
        const url = `http://localhost:5000/api/user/wishlist/${productId}`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                ...(method === 'POST' ? { body: JSON.stringify({ productId }) } : {}),
            });

            const data = await res.json();
            setWishlist(data.wishlist.map(id => (typeof id === 'string' ? id : id._id)));
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