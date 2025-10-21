/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            animation: {
                'slide-in-left': 'slideInLeft 0.3s ease-out',
                fade: 'fadeIn 2s ease-in-out',
                bounce: 'bounce 1s infinite',
                slide: 'slideIn 4s ease-in-out',
            },
            keyframes: {
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                },
            },
            fontFamily: {
                primary: ['var(--font-inter)'],
                heading: ['var(--font-playfair)'],
                display: ['"Playfair Display"', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#121212',
                accent: '#f4a261',
                soft: '#fefae0',
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide'),
    ],
}