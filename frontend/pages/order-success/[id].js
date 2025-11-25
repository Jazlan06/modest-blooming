// pages/order-success/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 text-lg animate-pulse">
                Loading your order details...
            </div>
        );

    if (!order)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 text-lg">
                Order not found!
            </div>
        );

    return (
        <>
            <Head>
                <title>Order Confirmation | Modest Blooming</title>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="description" content="Your order has been successfully placed. Thank you for shopping with Modest Blooming." />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex justify-center py-10 sm:py-12 px-4 md:px-8 lg:px-16">
                <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200 animate-fadeIn">
                    {/* SUCCESS HEADER */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 flex items-center justify-center rounded-full text-3xl sm:text-4xl shadow-md">
                            ✓
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-wide">
                            Payment Successful 🎉
                        </h1>

                        <p className="text-gray-600 mt-3 text-sm sm:text-base md:text-lg">
                            Thank you for shopping with{" "}
                            <span className="font-semibold">Modest Blooming</span>
                        </p>

                        <p className="text-gray-500 mt-2 text-sm sm:text-base">
                            Order ID: <span className="font-semibold">{order._id}</span>
                        </p>
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="border-t pt-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                            Order Summary
                        </h2>

                        <div className="space-y-4">
                            {order.products.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row justify-between gap-3 border rounded-xl p-4 shadow-sm bg-gray-50 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 text-base sm:text-lg">
                                            {item.product.name}
                                        </p>

                                        <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 mt-1">
                                            Qty: {item.quantity} | Variant: {item.selectedVariant?.colorName || "-"}
                                            {item.selectedVariant?.colorCode && (
                                                <span
                                                    className="inline-block w-3 h-3 rounded-full border"
                                                    style={{ backgroundColor: item.selectedVariant.colorCode }}
                                                ></span>
                                            )}
                                        </p>
                                    </div>

                                    <p className="font-bold text-gray-800 text-lg sm:text-xl mt-2 sm:mt-0">
                                        ₹{item.priceAtPurchase * item.quantity}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-6 pt-4">
                            <p className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount}</span>
                            </p>
                            {order.deliveryCharge > 0 && (
                                <p className="flex justify-between text-gray-600 text-sm sm:text-base mt-1">
                                    <span>Delivery Charge</span>
                                    <span>₹{order.deliveryCharge}</span>
                                </p>
                            )}
                        </div>

                        {/* SHIPPING INFO */}
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                Shipping Address
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm sm:text-base">
                                <p className="font-medium">{order.address.fullName || "N/A"}</p>
                                <p className="text-gray-600 mt-1">
                                    {order.address.street}, {order.address.apartment && order.address.apartment + ","} {order.address.locality && order.address.locality + ","} {order.address.city}, {order.address.state} - {order.address.pincode}
                                </p>
                                <p className="text-gray-600">Phone: {order.address.phone || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* BACK TO HOME BUTTON */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => router.push("/")}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-semibold font-body py-3 px-8 rounded-full shadow-lg transition-all duration-200 text-sm sm:text-base"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}