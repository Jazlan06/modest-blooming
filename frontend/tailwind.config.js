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
            },
            keyframes: {
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            fontFamily: {
                primary: ['var(--font-inter)'],
                heading: ['var(--font-playfair)'],
            },
            colors: {
                primary: '#121212',
                accent: '#f4a261',
                soft: '#fefae0',
            },
        },
    },
    plugins: [],
}