// pages/cart.js
import { useEffect, useState } from "react";
import { FaArrowLeft, FaHeart, FaTag } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import RecommendedProducts from "@/components/RecommendedProducts";
import Stepper from "@/components/Stepper";

export default function CartPage() {
    const router = useRouter();
    const { cart, addToCart, removeFromCart, fetchCart, updateCartQuantity } = useCart();
    const { wishlist, toggleWishlist } = useWishlist();
    const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    const [isCouponValid, setIsCouponValid] = useState(null);
    const [couponMessage, setCouponMessage] = useState("");
    const [checkingCoupon, setCheckingCoupon] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isHamper, setIsHamper] = useState(false);
    const [hamperNote, setHamperNote] = useState("");
    const [showHamperModal, setShowHamperModal] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [userAddress, setUserAddress] = useState();
    const [priceDetails, setPriceDetails] = useState({
        totalMrp: 0,
        discount: 0,
        totalAmount: 0,
    });
    const [totalWithDelivery, setTotalWithDelivery] = useState(priceDetails?.totalAmount || 0);

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        if (cart.length > 0) {
            let totalMrp = 0,
                discount = 0;

            cart.forEach((item) => {
                const p = item?.product;
                if (!p) return;

                const price = p.price;
                const discountPrice = p.discountPrice || price;
                totalMrp += price * item.quantity;
                discount += (price - discountPrice) * item.quantity;
            });

            const totalAmount = totalMrp - discount;
            setPriceDetails({ totalMrp, discount, totalAmount });
        } else {
            setPriceDetails({ totalMrp: 0, discount: 0, totalAmount: 0 });
        }
    }, [cart]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem("token"); // get token
                if (!token) {
                    console.warn("No token found. User might not be logged in.");
                    setUserAddress(null);
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/address', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const defaultAddr = res.data.find(addr => addr.isDefault);
                setUserAddress(defaultAddr || res.data[0] || null);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    console.error("Unauthorized! Please login.");
                } else {
                    console.error("Error fetching addresses:", err);
                }
                setUserAddress(null); // fallback to null if error
            }
        };

        fetchAddresses();
    }, []);

    const handleCheckCoupon = async () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login to apply coupon");

        setCheckingCoupon(true);
        setCouponMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/coupons/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: couponCode.trim().toUpperCase(),
                    totalAmount: priceDetails.totalAmount,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setIsCouponValid(true);
                setCouponMessage(`✅ ${data.message}: You saved ₹${data.discount.toFixed(2)}!`);
                setCouponDiscount(data.discount);
            } else {
                setIsCouponValid(false);
                setCouponMessage(`❌ ${data.message}`);
                setCouponDiscount(0);
            }
        } catch (err) {
            setIsCouponValid(false);
            setCouponMessage("❌ Error verifying coupon.");
            console.error(err);
        } finally {
            setCheckingCoupon(false);
        }
    };

    const handleApplyCoupon = () => {
        if (isCouponValid && couponDiscount > 0) {
            const newTotal = priceDetails.totalAmount - couponDiscount;
            setPriceDetails({ ...priceDetails, totalAmount: newTotal });
            setAppliedCoupon(couponCode.trim().toUpperCase());
            setCouponModalOpen(false);
            setIsCouponValid(null);
            setCouponCode("");
            setCouponMessage("");
        }
    };

    const updateDeliveryCharge = async () => {
        try {
            if (!userAddress || cart.length === 0) return;

            const res = await fetch("http://localhost:5000/api/delivery/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cartItems: cart.map((item) => ({
                        product: item.product,
                        selectedVariant: item.selectedVariant,
                        quantity: item.quantity,
                    })),
                    address: userAddress,
                    isHamper,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setDeliveryCharge(data.deliveryCharge);
                setTotalWithDelivery(priceDetails.totalAmount + data.deliveryCharge);
            } else {
                console.warn("Delivery charge calculation failed:", data.message);
                setDeliveryCharge(0);
                setTotalWithDelivery(priceDetails.totalAmount);
            }
        } catch (err) {
            console.error("Error updating delivery charge:", err);
        }
    };

    useEffect(() => {
        updateDeliveryCharge();
    }, [cart, userAddress]);

    const steps = ['Cart', 'Address', 'Payment'];
    const currentStep = 0;

    return (
        <>
            <Head>
                <title>Your Cart | Modest Blooming</title>
                <meta name="description" content="View the items in your shopping cart at Modest Blooming before proceeding to checkout." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
                {/* ======= Header ======= */}
                <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-20 flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <FaArrowLeft
                            size={22}
                            className="cursor-pointer text-gray-700 hover:text-[#F4C2C2] transition"
                            onClick={() => router.back()}
                        />
                        <h1 className="text-lg md:text-xl font-semibold font-display tracking-tight">
                            Shopping Cart
                        </h1>
                    </div>

                    <FaHeart
                        size={22}
                        className="cursor-pointer text-[#F4C2C2] hover:text-pink-500 transition-transform hover:scale-110"
                        onClick={() => setWishlistModalOpen(true)}
                    />
                </header>

                {/* ======= Stepper ======= */}
                <Stepper steps={steps} currentStep={currentStep} />

                {/* ======= Address Section ======= */}
                <section className="bg-white/90 p-4 shadow-sm mt-4 mx-3 md:mx-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-body text-gray-600 font-medium mb-1">
                                Deliver to:
                            </h2>
                            {userAddress ? (
                                <p className="font-semibold font-body text-gray-800 leading-snug">
                                    {userAddress.fullName}, {userAddress.street}, {userAddress.city}
                                </p>
                            ) : (
                                <p className="text-gray-400 font-body text-sm italic">
                                    No address added yet
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => router.push("/address")}
                            className="text-[#F4C2C2] font-semibold text-sm hover:underline hover:text-pink-500 transition"
                        >
                            {userAddress ? "Change" : "Add Address"}
                        </button>
                    </div>
                </section>

                {/* ======= Cart Items ======= */}
                <section className="mt-6 space-y-4 mx-3 md:mx-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-2 md:mx-6 mt-8 transition-all duration-500">
                            {/* Elegant built-in SVG illustration */}
                            <div className="w-40 h-40 mb-6 opacity-90">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 64 64"
                                    className="w-full h-full text-[#F4C2C2]"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 6h10l7.5 35h33l7-21H17"
                                    />
                                    <circle cx="25" cy="54" r="3" fill="currentColor" />
                                    <circle cx="49" cy="54" r="3" fill="currentColor" />
                                </svg>
                            </div>

                            {/* Text */}
                            <h2 className="text-2xl font-semibold font-heading text-gray-800 mb-2 tracking-tight">
                                Your cart is empty
                            </h2>
                            <p className="text-gray-500 font-serif text-sm md:text-base mb-8 max-w-sm leading-relaxed">
                                You haven’t added anything yet. Discover styles you’ll fall in love with —
                                your next favorite find is just a click away.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => router.push("/products")}
                                    className="bg-[#F4C2C2] font-body hover:bg-pink-400 text-white px-8 py-2.5 rounded-full text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all"
                                >
                                    Start Shopping
                                </button>

                                <button
                                    onClick={() => router.push("/wishlist")}
                                    className="border font-body border-[#F4C2C2] text-[#F4C2C2] hover:bg-[#F4C2C2] hover:text-white px-8 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all"
                                >
                                    View Wishlist
                                </button>
                            </div>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const p = item.product;
                            if (!p) return null;

                            return (
                                <div
                                    key={item._id || p._id}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 flex gap-4 relative"
                                >
                                    {/* Product Image */}
                                    <div
                                        onClick={() => router.push(`/product/${p.slug}`)}
                                        className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 relative cursor-pointer group"
                                    >
                                        <Image
                                            src={
                                                p.selectedVariant?.images[0] ||
                                                p.media?.[0] ||
                                                p.colors?.[0]?.images?.[0] ||
                                                "/placeholder.png"
                                            }
                                            alt={p.name || "Product image"}
                                            fill
                                            className="object-fill rounded-md group-hover:opacity-90 transition"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-col flex-grow justify-between">
                                        <div>
                                            <h3
                                                className="font-semibold font-display text-lg md:text-base cursor-pointer text-gray-800 hover:text-[#F4C2C2] transition"
                                                onClick={() => router.push(`/product/${p.slug}`)}
                                            >
                                                {p.name}
                                            </h3>

                                            {/* ===== Selected Variant ===== */}
                                            {item.selectedColor && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{ backgroundColor: item.selectedColor.colorCode }}
                                                    />
                                                    {/* Optional: show the color name */}
                                                    <span className="text-sm text-gray-700">{item.selectedColor.colorName}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="font-semibold font-body text-lg text-gray-900">
                                                    ₹{(p.selectedVariant?.discountPrice || p.selectedVariant?.price || p.discountPrice || p.price) * item.quantity}
                                                </span>
                                                {p.discountPrice && (
                                                    <span className="text-gray-400 line-through text-sm">
                                                        ₹{p.price * item.quantity}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Qty:</span>
                                                <select
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateCartQuantity(p._id, parseInt(e.target.value))
                                                    }
                                                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#F4C2C2] focus:outline-none transition"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                                                        <option key={q} value={q}>
                                                            {q}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(p._id)}
                                            className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-lg transition"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </section>

                {/* ======= Recommendations ======= */}
                <section className="mt-10 mx-3 md:mx-6">
                    <RecommendedProducts />
                </section>

                {/* ======= Hamper Section ======= */}
                <hr className="border-gray-100 mx-6 mt-8" />
                <section className="mt-10 mx-3 md:mx-6 bg-white shadow-sm rounded-xl p-5 border border-gray-100">
                    <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
                        Want to Make it a Hamper?
                    </h2>

                    <div className="flex items-center gap-3 mb-3">
                        <input
                            type="checkbox"
                            id="isHamper"
                            checked={isHamper}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setIsHamper(checked);
                                if (checked) {
                                    setShowHamperModal(true);
                                    setTimeout(() => setShowHamperModal(false), 4500); // hide after 4.5s
                                }
                            }}
                            className="w-5 h-5 text-pink-500 rounded focus:ring-pink-300 border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="isHamper" className="font-body text-gray-700 cursor-pointer">
                            Yes, please pack it beautifully as a gift hamper
                        </label>
                    </div>

                    {isHamper && (
                        <div className="mt-3">
                            <label
                                htmlFor="hamperNote"
                                className="block text-sm font-body text-gray-600 mb-2"
                            >
                                Add any special request (e.g. card message, wrapping color, etc.):
                            </label>
                            <textarea
                                id="hamperNote"
                                value={hamperNote}
                                onChange={(e) => setHamperNote(e.target.value)}
                                rows="3"
                                placeholder="Please include a small note saying ‘Happy Birthday Sania!’"
                                className="w-full border border-gray-300 rounded-md p-3 text-sm font-body text-gray-700 focus:ring-2 focus:ring-[#F4C2C2] focus:outline-none resize-none"
                            />
                            {/* ======= Hamper Info Modal ======= */}
                            {showHamperModal && (
                                <div className="fixed inset-0 flex justify-center items-end sm:items-center z-[100]">
                                    {/* Backdrop blur */}
                                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"></div>

                                    <div className="relative bg-white rounded-2xl shadow-2xl mx-4 p-6 sm:max-w-md sm:mx-auto text-center border border-pink-100 animate-slide-up">
                                        <div className="flex justify-center mb-3">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#F4C2C2] to-pink-400 flex items-center justify-center shadow-md">
                                                <span className="text-2xl">🎁</span>
                                            </div>
                                        </div>

                                        <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
                                            Hamper Added
                                        </h3>
                                        <p className="text-gray-600 text-sm font-body leading-relaxed">
                                            Your order will now be <span className="text-[#F4C2C2] font-medium">beautifully packed</span> as a gift hamper.
                                            This adds <span className="font-semibold">0.25 kg</span> to the total weight, charges applicable.
                                        </p>

                                        <div className="mt-4">
                                            <div className="h-1 w-28 bg-gradient-to-r from-[#F4C2C2] to-pink-400 rounded-full mx-auto animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>


                {/* ======= Payment Summary ======= */}
                <section className="mt-10 mx-3 md:mx-6 bg-white shadow-sm rounded-xl p-5 border border-gray-100">
                    {/* Coupon Section */}
                    <div
                        onClick={() => setCouponModalOpen(true)}
                        className="flex justify-between items-center border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-50 rounded-md px-2 transition"
                    >
                        <div className="flex items-center gap-3">
                            <FaTag className="text-[#F4C2C2]" />
                            <span className="font-semibold text-gray-800 font-body">Apply Coupon</span>
                        </div>
                        <span className="text-gray-400 font-body text-lg">&gt;</span>
                    </div>

                    {/* Price Details */}
                    <div className="mt-4 mb-[6rem] space-y-2 text-sm text-gray-700 ">
                        <div className="flex justify-between">
                            <span>Total MRP ({cart.length} items)</span>
                            <span>₹{priceDetails.totalMrp.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount on MRP</span>
                            <span className="text-green-600">
                                - ₹{priceDetails.discount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Coupon Discount</span>
                            {appliedCoupon ? (
                                <span className="text-green-600">
                                    - ₹{couponDiscount.toFixed(2)}
                                </span>
                            ) : (
                                <button
                                    onClick={() => setCouponModalOpen(true)}
                                    className="text-[#F4C2C2] font-semibold text-sm hover:underline"
                                >
                                    Apply Coupon
                                </button>
                            )}
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Delivery Charge</span>
                            <span>₹{deliveryCharge.toFixed(2)}</span>
                        </div>
                        <hr className="my-2 border-gray-200" />
                        <div className="flex justify-between font-semibold text-base text-gray-900">
                            <span>Total Amount</span>
                            <span>₹{(priceDetails.totalAmount + deliveryCharge).toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                {/* ======= Fixed Bottom Checkout Bar ======= */}
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t shadow-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between items-center gap-2 sm:gap-0">
                        <p className="text-sm font-medium text-gray-700 font-body">
                            {cart.length} item(s) selected
                        </p>
                        <button
                            onClick={() => {
                                try {
                                    const token = localStorage.getItem("token");
                                    if (!token) return alert("Please login to place order");

                                    const tempOrder = {
                                        products: cart.map((item) => ({
                                            product: item.product._id,
                                            name: item.product.name,
                                            quantity: item.quantity,
                                            selectedVariant: item.selectedColor
                                                ? item.selectedColor
                                                : { colorName: "-", colorCode: "" },
                                            priceAtPurchase: item.product.discountPrice || item.product.price,
                                        })),
                                        priceDetails,
                                        deliveryCharge,
                                        couponApplied: appliedCoupon || null,
                                        isHamper,
                                        hamperNote,
                                    };
                                    localStorage.setItem("tempOrder", JSON.stringify(tempOrder));
                                    router.push(`/address?redirect=payment`);
                                } catch (err) {
                                    console.error("❌ Error saving temp order:", err);
                                    alert("Something went wrong. Try again.");
                                }
                            }}
                            className="w-full sm:w-auto font-body bg-gradient-to-r from-[#F4C2C2] to-pink-400 text-white px-6 py-2.5 rounded-md font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md"
                        >
                            PLACE ORDER
                        </button>
                    </div>
                )}


                {/* ======= Wishlist Modal ======= */}
                {wishlistModalOpen && (
                    <div
                        className="fixed hide-scrollbar inset-0 bg-black/60 flex justify-center items-end z-50 backdrop-blur-sm"
                        onClick={() => setWishlistModalOpen(false)} // Clicking on backdrop closes modal
                    >
                        <div
                            className="bg-white w-full md:w-[650px] max-h-[75vh] rounded-t-3xl p-6 overflow-hidden shadow-2xl animate-slide-up relative"
                            onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                                    Wishlist
                                </h2>
                                <button
                                    className="text-pink-500 font-medium font-body hover:underline"
                                    onClick={() => router.push("/wishlist")}
                                >
                                    View All
                                </button>
                            </div>

                            {/* Loading / Empty / Items */}
                            {!wishlist ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm">Loading your wishlist...</p>
                                </div>
                            ) : wishlist.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <Image
                                        src="/empty-wishlist.svg"
                                        alt="Empty wishlist"
                                        width={140}
                                        height={140}
                                        className="mb-3 opacity-80"
                                    />
                                    <p className="text-sm font-medium">Your wishlist is empty 💔</p>
                                </div>
                            ) : (
                                <div className="relative cursor-pointer">
                                    <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scroll-smooth pb-4 hide-scrollbar">
                                        {wishlist.map((p) => (
                                            <div
                                                key={p._id}
                                                className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[250px] rounded-2xl shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:-translate-y-2 snap-start bg-gradient-to-b from-white to-gray-50 border border-gray-100"
                                            >
                                                <div
                                                    className="relative w-full aspect-square cursor-pointer rounded-2xl overflow-hidden group"
                                                    onClick={() => router.push(`/product/${p.slug}`)}
                                                >
                                                    <Image
                                                        src={p.media?.[0] || p.colors?.[0]?.images?.[0] || "/placeholder.png"}
                                                        alt={p.name}
                                                        fill
                                                        className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <span className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1 text-sm font-bold shadow-md">
                                                        ❤️
                                                    </span>
                                                </div>

                                                <div className="p-3">
                                                    <p className="text-xl font-semibold truncate font-body text-gray-900">{p.name}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="font-bold text-xl font-body text-[#F4C2C2]">₹{p.discountPrice || p.price}</span>
                                                        {p.discountPrice && (
                                                            <span className="text-gray-400 line-through text-lg">₹{p.price}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="mt-3 w-full font-body bg-[#F4C2C2] text-white py-1 rounded-md text-base font-semibold hover:bg-pink-600 transition"
                                                        onClick={() => {
                                                            addToCart(p._id);
                                                            toggleWishlist(p._id);
                                                        }}
                                                    >
                                                        MOVE TO CART
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======= Coupon Modal ======= */}
                {couponModalOpen && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-30">
                        <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-2xl text-center relative animate-fadeIn">
                            <h3 className="font-body text-lg font-semibold mb-4 text-gray-800">
                                Apply Coupon
                            </h3>

                            {/* Input + Check */}
                            <div className="flex flex-col items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value.toUpperCase());
                                        setIsCouponValid(null);
                                        setCouponMessage("");
                                    }}
                                    className="border font-body border-gray-300 w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-[#F4C2C2] text-center uppercase tracking-wider text-gray-700"
                                />

                                <button
                                    onClick={handleCheckCoupon}
                                    disabled={!couponCode.trim() || checkingCoupon}
                                    className="bg-gradient-to-r from-[#F4C2C2] to-pink-400 text-white font-body px-5 py-2 rounded-md font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {checkingCoupon ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                            Checking...
                                        </>
                                    ) : (
                                        "Check Coupon"
                                    )}
                                </button>

                                {couponMessage && (
                                    <p
                                        className={`font-medium font-body mt-2 ${isCouponValid ? "text-green-600" : "text-red-500"
                                            }`}
                                    >
                                        {couponMessage}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setCouponModalOpen(false)}
                                    className="text-gray-500 font-body font-medium hover:text-gray-700 transition"
                                >
                                    Cancel
                                </button>

                                {isCouponValid && (
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-green-500 font-body text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition"
                                    >
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
CartPage.isPrivate = true;