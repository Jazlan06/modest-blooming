'use client';

import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function OrderDetailsModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-lg shadow-lg relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Order Details</h2>

        <p className="mb-2">
          <strong>Order ID:</strong> {order._id}
        </p>
        <p className="mb-2">
          <strong>Status:</strong> {order.status}
        </p>
        <p className="mb-2">
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
        <p className="mb-4">
          <strong>Delivery Charge:</strong> ₹{order.deliveryCharge}
        </p>

        <h3 className="text-xl font-semibold mb-2">Products:</h3>
        <ul className="divide-y divide-gray-200 mb-4">
          {order.products.map((p) => (
            <li key={p.product._id} className="py-2 flex justify-between">
              <span>{p.product.name} x {p.quantity}</span>
              <span>₹{p.priceAtPurchase}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mb-2">Shipping Address:</h3>
        <p>
          {order.address.fullName}, {order.address.apartment}, {order.address.street},<br />
          {order.address.locality}, {order.address.city}, {order.address.state} - {order.address.pincode}
        </p>
      </motion.div>
    </div>
  );
}