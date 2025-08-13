"use client";

import { useEffect, useState } from "react";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";

export default function FavouritesPage() {
  const { favorites, setFavorites, toggleFavorite } = useFavoriteStore();
  const { addToCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/favorites");
        const favoriteIds = await res.json();

        // Fetch product details for these IDs
        const productsRes = await fetch("/api/products");
        const products = await productsRes.json();

        // Match favorite IDs with products
        const favoriteProducts = products.filter((p) =>
          favoriteIds.includes(p._id)
        );

        setFavorites(favoriteProducts);
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [setFavorites]);

  const handleAddToCart = (product) => {
    addToCart({ product, quantity: 1 });
    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      text: `${product.productName} has been added to your cart.`,
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading favorites...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">❤️</span>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            My Favorites
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {favorites.length} items
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No favorites yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Start adding items to your favorites to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={product.images?.[0] || "/fallback-image.jpg"}
                    alt={product.productName}
                    width={80}
                    height={80}
                    className="object-cover rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {product.category}
                        </p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          ৳{product.price}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleFavorite(product._id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                        title="Remove from favorites"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        Add to Cart
                      </button>

                      <Link
                        href={"/payment"}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
