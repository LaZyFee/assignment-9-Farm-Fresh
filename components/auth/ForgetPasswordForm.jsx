/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Fixed API endpoint path
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("API response:", { status: response.status, data });

      if (response.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        console.log("API error:", data.error);
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 p-3 rounded-full">
            <i className="fas fa-key text-white text-2xl"></i>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-3"></i>
              <div>
                <h4 className="text-green-800 dark:text-green-200 font-medium">
                  Email sent successfully!
                </h4>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="john@example.com"
              />
              <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to login
          </Link>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          <i className="fas fa-info-circle mr-2"></i>
          Need help?
        </h3>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p>• Check your spam/junk folder if you don't receive the email</p>
          <p>• Make sure you entered the correct email address</p>
          <p>• Contact support if you continue having issues</p>
        </div>
        <div className="mt-3">
          <a
            href="#"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
