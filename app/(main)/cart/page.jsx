"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, setCart } =
    useCartStore();
  const router = useRouter();
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const cartData = await res.json();
          setCart(cartData);
        } else {
          console.error("Failed to fetch cart");
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    }
    fetchCart();
  }, [setCart]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    router.push("/payment");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium mb-8 text-gray-900 dark:text-gray-100">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your cart is empty
            </p>
            <Link
              href="/products"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.product.images?.[0] || "/fallback-image.jpg"}
                      alt={item.product.productName}
                      fill
                      sizes="64px"
                      className="object-cover rounded"
                      onError={(e) => (e.target.src = "/fallback-image.jpg")}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.product.productName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      ৳{item.product.price.toFixed(2)} / {item.product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-16">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ৳{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 ml-2 text-xl"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Tax (8%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Checkout
              </button>
              <Link
                href="/products"
                className="block w-full text-center text-gray-600 dark:text-gray-300 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
