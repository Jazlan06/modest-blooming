// components/Footer.js
import Link from "next/link";
import Image from "next/image";
import {
    FaInstagram,
    FaWhatsapp,
    FaFacebook,
    FaHome,
    FaInfoCircle,
    FaShoppingBag,
    FaTags,
    FaStar,
    FaCartPlus,
    FaHeart,
    FaClipboardList,
} from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: "Shop",
            links: [
                { icon: <FaHome />, label: "Home", href: "/" },
                { icon: <FaInfoCircle />, label: "About", href: "/about" },
                { icon: <FaShoppingBag />, label: "Shop", href: "/products" },
                { icon: <FaTags />, label: "Sale", href: "/sale" },
                { icon: <FaStar />, label: "Best-Sellers", href: "/best-sellers" },
                { icon: <FaStar />, label: "New Arrivals", href: "/new-arrivals" },
            ],
        },
        {
            title: "Help",
            links: [
                { icon: <FaInfoCircle />, label: "Contact", href: "/contact" },
                { icon: <FaClipboardList />, label: "FAQs", href: "/faqs" },
            ],
        },
        {
            title: "My",
            links: [
                { icon: <FaCartPlus />, label: "Cart", href: "/cart" },
                { icon: <FaHeart />, label: "Wishlist", href: "/wishlist" },
                { icon: <FaClipboardList />, label: "Orders", href: "/orders" },
            ],
        },
        {
            title: "Follow Us",
            links: [
                { icon: <FaInstagram />, href: "https://instagram.com/modest.blooming" },
                { icon: <FaWhatsapp />, href: "https://wa.me/7506799689" },
                { icon: <FaFacebook />, href: "https://facebook.com" },
            ],
        },
    ];

    return (
        <footer className="bg-gradient-to-t from-[#F4C2C2] to-[#F9D3D3] text-white">
            <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">

                {footerSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-base sm:text-lg font-semibold font-serif mb-2 sm:mb-4">{section.title}</h3>
                        {section.title !== "Follow Us" ? (
                            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                {section.links.map(({ icon, label, href }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="flex items-center gap-2 hover:text-gray-100 transition-colors relative group"
                                        >
                                            <span className="text-white/80">{icon}</span>
                                            <span className="relative z-10 font-body">{label}</span>
                                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex gap-4 sm:gap-5 text-xl sm:text-2xl mt-1">
                                {section.links.map(({ icon, href }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-gray-100 transition transform hover:scale-110 hover:shadow-md rounded-full p-1"
                                    >
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/30 sm:mt-6 py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Modest Blooming Logo"
                            width={210}
                            height={70}
                            className="transition-transform transform hover:scale-105"
                            priority
                        />
                    </Link>
                    <p className="text-xs font-body sm:text-lg md:text-xl text-white/80 text-center sm:text-left">
                        &copy; {currentYear} Modest Blooming. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;