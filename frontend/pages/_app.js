// pages/_app.js
import '@/styles/globals.css';
import Head from 'next/head';
import { Inter, Playfair_Display } from 'next/font/google';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export default function App({ Component, pageProps }) {
    // Detect if the page is marked as private/admin
    const isPrivate = Component.isPrivate;

    return (
        <>
            <Head>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="48x48" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
                <meta property="og:image" content="/logo.png" />
                <meta name="theme-color" content="#8B3E5D" />
                {isPrivate && <meta name="robots" content="noindex, nofollow" />}
            </Head>

            <main className={`${inter.variable} ${playfair.variable} font-sans`}>
                <CartProvider>
                    <WishlistProvider>
                        <Component {...pageProps} />
                    </WishlistProvider>
                </CartProvider>
            </main>
        </>
    );
}