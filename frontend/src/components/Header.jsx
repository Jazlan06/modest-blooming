import React, { useState } from "react";
import { HiMenu, HiSearch, HiOutlineUser, HiOutlineShoppingBag } from "react-icons/hi";
import muslimahImg from "../assets/hijab.png"; // Image import

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-[#DD868C] shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left side: Hamburger + Search */}
                <div className="flex items-center space-x-3 md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <HiMenu className="w-6 h-6 text-white" />
                    </button>
                    <button>
                        <HiSearch className="w-5 h-5 ml-[5px] text-white" />
                    </button>
                </div>

                {/* Center: Logo image + Brand name */}
                <div className="flex items-center space-x-3 mx-auto md:mx-0">
                    <img
                        src={muslimahImg}
                        alt="Hijab Logo"
                        className="w-14 h-14 object-cover rounded-full"
                    />
                    <div className="text-white font-cormorant font-semibold leading-snug text-xl sm:text-2xl tracking-wide">
                        <div>Modest</div>
                        <div>Blooming</div>
                    </div>
                </div>

                {/* Right side: Profile + Cart */}
                <div className="flex items-center space-x-4 md:ml-auto">
                    <button>
                        <HiOutlineUser className="w-6 h-6 text-white" />
                    </button>
                    <button>
                        <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Optional dropdown for nav links */}
            {isMenuOpen && (
                <div className="bg-white text-gray-700 px-4 py-2 md:hidden">
                    <a href="#" className="block py-1">Home</a>
                    <a href="#" className="block py-1">Shop</a>
                    <a href="#" className="block py-1">About</a>
                    <a href="#" className="block py-1">Contact</a>
                </div>
            )}
        </header>
    );
};

export default Header;
