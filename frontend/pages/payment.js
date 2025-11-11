// pages/payment.js
import { useEffect, useState } from "react";
import Script from "next/script";

export default function PaymentPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedOrder = localStorage.getItem("currentOrder");
        if (!storedOrder || storedOrder === "undefined") {
            alert("No order found! Redirecting to cart.");
            window.location.href = "/cart";
            return;
        }

        try {
            const parsed = JSON.parse(storedOrder);
            setOrder(parsed);
        } catch (err) {
            console.error("❌ Failed to parse currentOrder:", err);
            localStorage.removeItem("currentOrder");
            window.location.href = "/cart";
            return;
        }

        setLoading(false);
    }, []);

    const handlePayment = async () => {
        if (!order) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to proceed with payment.");
                window.location.href = "/login";
                return;
            }
            const res = await fetch("http://localhost:5000/api/payments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    orderId: order._id,
                    paymentMethod: "razorpay",
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();

            // 2️⃣ Configure Razorpay checkout
            const options = {
                key: data.key,
                amount: data.amount * 100, // convert to paise
                currency: data.currency,
                name: "Your Brand Name",
                description: `Payment for Order #${order._id}`,
                order_id: data.rzpOrderId,
                handler: function (response) {
                    alert("✅ Payment successful! Payment ID: " + response.razorpay_payment_id);

                    // Optionally: Verify payment with backend
                    fetch("http://localhost:5000/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                },
                theme: { color: "#F4C2C2" },
            };

            // 3️⃣ Open Razorpay UI
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Something went wrong while initiating payment.");
        }
    };

    if (loading) return <p>Loading order...</p>;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
            {/* Razorpay script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-white shadow-lg rounded-lg p-6">
                {/* ===== Left: Order Summary ===== */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        {order.products.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.quantity} | Variant: {item.selectedVariant}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    ₹{item.priceAtPurchase * item.quantity}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-4 pt-4">
                        <p className="flex justify-between font-semibold text-lg">
                            <span>Total Amount</span>
                            <span>₹{order.totalAmount}</span>
                        </p>
                        {order.couponApplied && (
                            <p className="text-green-600 mt-1">
                                Coupon Applied: {order.couponApplied}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold mb-1">Shipping Address</h3>
                        <p>{order.addressId?.name}</p>
                        <p>
                            {order.addressId?.street}, {order.addressId?.city},{" "}
                            {order.addressId?.state} - {order.addressId?.zip}
                        </p>
                        <p>Phone: {order.addressId?.phone}</p>
                    </div>
                </div>

                {/* ===== Right: Payment Section ===== */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Complete Payment</h2>
                    <div className="border p-4 rounded-lg bg-gray-50 mb-4">
                        <p className="font-medium mb-1">Pay using UPI, Cards or Wallets</p>
                        <p className="text-sm text-gray-600">
                            Secure payment powered by Razorpay.
                        </p>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
                    >
                        Pay ₹{order.totalAmount}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                        100% secure payments via UPI, Cards, and Wallets.
                    </p>
                </div>
            </div>
        </div>
    );
}
