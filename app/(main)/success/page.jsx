"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheck,
  FaEnvelope,
  FaCreditCard,
  FaCopy,
  FaDownload,
  FaList,
  FaHome,
} from "react-icons/fa";

export default function SuccessPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then(setOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Icon and Message */}
      <div className="text-center mb-12">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <FaCheck className="text-4xl text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Thank you for your order
        </p>
        <p className="text-gray-500 dark:text-gray-500">Order #{order._id}</p>
      </div>

      {/* Email Confirmation Notice */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center">
          <FaEnvelope className="text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Email Confirmation Sent
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We've sent your order confirmation and receipt to your email
              address.
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Order Details
          </h2>

          {order.items.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <Image
                src={item.product.images?.[0] || "/placeholder.png"}
                alt={item.product.productName}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.product.productName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By {item.product.farmer?.farmName || "Farm"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quantity: {item.quantity} kg
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ৳{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}

          {/* Delivery Info */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Delivery Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Date:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Time:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {order.deliveryTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Address:
                </span>
                <span className="text-gray-900 dark:text-white text-right">
                  {order.deliveryAddress}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payment Summary
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal:
              </span>
              <span className="text-gray-900 dark:text-white">৳{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Fee:
              </span>
              <span className="text-gray-900 dark:text-white">৳50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Service Fee:
              </span>
              <span className="text-gray-900 dark:text-white">৳25</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total Paid:</span>
                <span>৳{order.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Payment Method
            </h3>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FaCreditCard className="text-lg text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.paymentMethod}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paid on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transaction ID
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {order.transactionId}
                </p>
              </div>
              <button
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                onClick={() =>
                  navigator.clipboard.writeText(order.transactionId)
                }
              >
                <FaCopy />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href={`/api/invoice/${order._id}`}
          download
          className="flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
        >
          <FaDownload className="mr-2" />
          Download Receipt (PDF)
        </a>
        <Link
          href="/bookings"
          className="flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition"
        >
          <FaList className="mr-2" />
          View All Orders
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center px-8 py-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition"
        >
          <FaHome className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
