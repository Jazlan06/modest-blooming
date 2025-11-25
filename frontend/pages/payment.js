// pages/payment.js
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCart } from '../context/CartContext';
import Head from "next/head";
export default function PaymentPage() {
    const [tempOrder, setTempOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderId, setSuccessOrderId] = useState(null);

    const router = useRouter();
    const { clearCart } = useCart();

    useEffect(() => {
        const storedOrder = localStorage.getItem("tempOrder");
        if (!storedOrder || storedOrder === "undefined") {
            alert("No order details found! Redirecting to cart.");
            router.push("/cart");
            return;
        }

        try {
            const parsed = JSON.parse(storedOrder);
            setTempOrder(parsed);
        } catch (err) {
            console.error("❌ Failed to parse tempOrder:", err);
            localStorage.removeItem("tempOrder");
            router.push("/cart");
            return;
        }

        setLoading(false);
    }, [router]);

    if (loading) return <p className="text-center mt-20 text-gray-600">Loading payment details...</p>;

    const finalAmount =
        (tempOrder?.priceDetails?.totalAmount || 0) +
        (tempOrder?.deliveryCharge || 0);

    const handlePayment = async () => {
        if (!tempOrder) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to proceed with payment.");
                router.push("/login");
                return;
            }

            const res = await fetch("http://localhost:5000/api/payments/create-temp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: finalAmount,
                    currency: "INR",
                    receipt: `temp_${Date.now()}`,
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "Modest Blooming",
                description: "Order Payment",
                order_id: data.rzpOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                checkoutData: {
                                    products: tempOrder.products.map(p => ({
                                        product: p.product?._id || p.product,
                                        quantity: p.quantity,
                                        selectedVariant: p.selectedVariant || { colorName: "-", colorCode: "" },
                                        priceAtPurchase: p.priceAtPurchase,
                                    })),
                                    totalAmount: tempOrder.priceDetails.totalAmount,
                                    deliveryCharge: tempOrder.deliveryCharge,
                                    couponApplied: tempOrder.couponApplied || null,
                                    isHamper: tempOrder.isHamper || false,
                                    hamperNote: tempOrder.hamperNote || "",
                                    address: { ...tempOrder.address },
                                    paymentMethod: "razorpay"
                                }
                            }),
                        });

                        if (!verifyRes.ok) throw new Error(await verifyRes.text());

                        const result = await verifyRes.json();
                        setSuccessOrderId(result.order._id);
                        setShowSuccessModal(true); // Show modal
                        localStorage.removeItem("tempOrder");
                        await clearCart();
                    } catch (err) {
                        console.error("❌ Error verifying payment:", err);
                        alert("Something went wrong verifying your payment.");
                    }
                },
                theme: { color: "#F4C2C2" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Something went wrong while initiating payment.");
        }
    };

    const closeModal = () => {
        setShowSuccessModal(false);
        if (successOrderId) router.push(`/order-success/${successOrderId}`);
    };

    return (
        <>
            <Head>
                <title>Payment | Modest Blooming</title>
                <meta
                    name="description"
                    content="Complete your payment securely for your Modest Blooming order. Pay via UPI, cards, or wallets with Razorpay."
                />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
                <Script src="https://checkout.razorpay.com/v1/checkout.js" />

                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ===== Left: Order Summary ===== */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Order Summary</h2>
                        <div className="flex-1 space-y-4">
                            {tempOrder.products.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity} | Variant: {item.selectedVariant?.colorName || "-"}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900">₹{item.priceAtPurchase * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-6 pt-4 space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Total Amount</span>
                                <span>₹{tempOrder.priceDetails.totalAmount.toFixed(2)}</span>
                            </div>
                            {tempOrder.couponApplied && (
                                <div className="text-green-600 font-medium">
                                    Coupon Applied: {tempOrder.couponApplied}
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Delivery Charge</span>
                                <span>₹{tempOrder.deliveryCharge.toFixed(2)}</span>
                            </div>
                            <hr className="my-2 border-gray-200" />
                            <div className="flex justify-between font-bold text-xl text-pink-600 bg-pink-50 rounded-lg px-4 py-3">
                                <span>Payable Amount</span>
                                <span>₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== Right: Payment Section ===== */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-between sticky top-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Complete Payment</h2>
                            <div className="border p-6 rounded-2xl bg-pink-50 mb-6 text-center">
                                <p className="font-medium text-gray-800 mb-1">Pay using UPI, Cards or Wallets</p>
                                <p className="text-sm text-gray-600">
                                    Secure payment powered by Razorpay.
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition duration-300 text-xl"
                            >
                                Pay ₹{finalAmount.toFixed(2)}
                            </button>

                            <p className="text-sm text-gray-500 text-center mt-4">
                                100% secure payments via UPI, Cards, and Wallets.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== Success Modal ===== */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                            <h3 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h3>
                            <p className="text-gray-700 mb-6">Thank you for your order. Your payment has been processed successfully.</p>
                            <button
                                onClick={closeModal}
                                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition"
                            >
                                Go to Order Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
PaymentPage.isPrivate = true;