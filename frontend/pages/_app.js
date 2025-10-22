import '@/styles/globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import { WishlistProvider } from '@/context/WishlistContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export default function App({ Component, pageProps }) {
    return (
        <main className={`${inter.variable} ${playfair.variable} font-sans`}>
            <WishlistProvider>
                <Component {...pageProps} />
            </WishlistProvider>
        </main>
    )
}