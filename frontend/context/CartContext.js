import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5000/api/user/my', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data?.cart && Array.isArray(data.cart)) {
                setCart(data.cart);
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart([]);
        }
    };

    const addToCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add items to cart');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/user/cart/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();
            setCart(data.cart.map(id => (typeof id === 'string' ? id : id._id)));
        } catch (err) {
            console.error('Error adding to cart:', err);
        }
    };

    const removeFromCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:5000/api/user/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data?.cart && Array.isArray(data.cart)) {
                setCart(data.cart);
            } else {
                fetchCart();
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
        }
    };

    const updateCartQuantity = async (productId, newQuantity) => {
        setCart(prev =>
            prev.map(item =>
                item.product._id === productId ? { ...item, quantity: newQuantity } : item
            )
        );

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:5000/api/user/cart/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: newQuantity }),
            });

            const data = await res.json();
            if (data?.cart) {
                setCart(data.cart);
            } else {
                fetchCart(); // fallback
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };


    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, fetchCart, updateCartQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);