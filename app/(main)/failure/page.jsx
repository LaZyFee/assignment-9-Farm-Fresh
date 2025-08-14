"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaExclamationTriangle,
  FaHome,
  FaShoppingCart,
  FaPhone,
  FaEnvelope,
  FaRedo,
} from "react-icons/fa";

export default function FailurePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const orderId = searchParams.get("order");

  const getErrorMessage = (errorType) => {
    switch (errorType) {
      case "payment_failed":
        return "Payment processing failed. Your card was not charged.";
      case "insufficient_stock":
        return "Some items in your cart are no longer available in the requested quantity.";
      case "validation_error":
        return "Please check your order details and try again.";
      case "network_error":
        return "Network connection error. Please check your internet connection.";
      case "server_error":
        return "Server error occurred. Our team has been notified.";
      case "session_expired":
        return "Your session has expired. Please log in again.";
      default:
        return "An unexpected error occurred while processing your order.";
    }
  };

  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case "payment_failed":
        return "Payment Failed";
      case "insufficient_stock":
        return "Items Unavailable";
      case "validation_error":
        return "Validation Error";
      case "network_error":
        return "Connection Error";
      case "server_error":
        return "Server Error";
      case "session_expired":
        return "Session Expired";
      default:
        return "Order Failed";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <FaExclamationTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {getErrorTitle(error)}
          </h1>

          {/* Error Message */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {getErrorMessage(error)}
          </p>

          {/* Order ID if available */}
          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reference ID:{" "}
                <span className="font-mono font-medium">{orderId}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/payment"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200"
            >
              <FaRedo className="mr-2" />
              Try Again
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition duration-200"
            >
              <FaShoppingCart className="mr-2" />
              View Cart
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition duration-200"
            >
              <FaHome className="mr-2" />
              Go Home
            </Link>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need Help?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:support@farmfresh.com"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <FaEnvelope className="mr-2" />
                Email Support
              </a>
              <a
                href="tel:+8801234567890"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <FaPhone className="mr-2" />
                Call Support
              </a>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What happens next?</strong>
              <br />
              • No charges have been made to your payment method
              <br />
              • Your cart items are still saved
              <br />
              • You can retry your order anytime
              <br />• Contact support if the problem persists
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
