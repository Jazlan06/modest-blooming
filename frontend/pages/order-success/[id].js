// pages/order-success/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { id } = router.query; 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch order");

        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
        alert("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading your order details...</p>;
  if (!order) return <p>Order not found!</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            🎉 Thank you for your order!
          </h1>
          <p className="text-gray-700 mb-6">
            Your payment of ₹{order.totalAmount} was successful.
          </p>
          <p className="text-gray-500 mb-6">Order ID: <strong>{order._id}</strong></p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          {order.products.map((item, idx) => (
            <div key={idx} className="flex justify-between border-b py-2">
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

          <div className="border-t mt-4 pt-4">
            <p className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-1">Shipping Address</h3>
            <p>{order.address.name}</p>
            <p>
              {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip}
            </p>
            <p>Phone: {order.address.phone}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}