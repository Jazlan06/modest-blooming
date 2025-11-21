// pages/payment.js
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const [tempOrder, setTempOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load temp order from localStorage
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

  // Handle payment click
  const handlePayment = async () => {
    if (!tempOrder) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to proceed with payment.");
        router.push("/login");
        return;
      }

      // 1️⃣ Create Razorpay order (temporary, no DB yet)
      const res = await fetch("http://localhost:5000/api/payments/create-temp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: tempOrder.totalAmount,
          currency: "INR",
          receipt: `temp_${Date.now()}`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();

      // 2️⃣ Configure Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Modest Blooming",
        description: "Order Payment",
        order_id: data.rzpOrderId,
        handler: async function (response) {
          // 3️⃣ On successful payment — verify & create order in DB
          try {
            const verifyRes = await fetch(
              "http://localhost:5000/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  checkoutData: tempOrder, // Full data: products, address, etc.
                }),
              }
            );

            if (!verifyRes.ok) {
              const errTxt = await verifyRes.text();
              throw new Error(errTxt);
            }

            const result = await verifyRes.json();
            const createdOrder = result.order;

            alert("✅ Payment successful! Your order has been placed.");
            localStorage.removeItem("tempOrder");
            router.push(`/order-success/${createdOrder._id}`);
          } catch (err) {
            console.error("❌ Error verifying payment:", err);
            alert("Something went wrong verifying your payment. Please contact support.");
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

  if (loading) return <p>Loading payment details...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-white shadow-lg rounded-lg p-6">
        {/* ===== Left: Order Summary ===== */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {tempOrder.products.map((item, idx) => (
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
              <span>₹{tempOrder.totalAmount}</span>
            </p>
            {tempOrder.couponApplied && (
              <p className="text-green-600 mt-1">
                Coupon Applied: {tempOrder.couponApplied}
              </p>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-1">Shipping Address</h3>
            <p>{tempOrder.address?.name}</p>
            <p>
              {tempOrder.address?.street}, {tempOrder.address?.city},{" "}
              {tempOrder.address?.state} - {tempOrder.address?.zip}
            </p>
            <p>Phone: {tempOrder.address?.phone}</p>
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
            Pay ₹{tempOrder.totalAmount}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            100% secure payments via UPI, Cards, and Wallets.
          </p>
        </div>
      </div>
    </div>
  );
}
