/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        heading: ['Playfair Display', 'serif']
      },
      colors: {
        primary: '#121212',
        accent: '#f4a261',
        soft: '#fefae0',
      }
    },
  },
  plugins: [],
}
