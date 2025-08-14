"use client";

import { useEffect, useState } from "react";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function FavouritesPage() {
  const { data: session, status } = useSession();
  const {
    favorites: favoriteIds,
    setFavorites,
    toggleFavorite,
  } = useFavoriteStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const farmer = session?.user?.userType === "farmer";

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/favorites");
        const favoriteIds = await res.json();

        // Update the store with favorite IDs
        setFavorites(favoriteIds);

        if (favoriteIds.length > 0) {
          // Fetch product details for these IDs
          const productsRes = await fetch("/api/products");
          const products = await productsRes.json();

          // Match favorite IDs with products
          const matchedProducts = products.filter((p) =>
            favoriteIds.includes(p._id)
          );

          setFavoriteProducts(matchedProducts);
        } else {
          setFavoriteProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [setFavorites]);

  // Update favorite products when favoriteIds change
  useEffect(() => {
    async function updateFavoriteProducts() {
      if (favoriteIds.length === 0) {
        setFavoriteProducts([]);
        return;
      }

      try {
        const productsRes = await fetch("/api/products");
        const products = await productsRes.json();

        const matchedProducts = products.filter((p) =>
          favoriteIds.includes(p._id)
        );

        setFavoriteProducts(matchedProducts);
      } catch (err) {
        console.error("Failed to update favorite products:", err);
      }
    }

    updateFavoriteProducts();
  }, [favoriteIds]);

  const handleAddToCart = (product) => {
    if (farmer) {
      Swal.fire({
        icon: "error",
        title: "Not Allowed",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        text: "Farmers can't buy products.",
      });
      return;
    }
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

  const handleRemoveFromFavorites = async (productId) => {
    try {
      await toggleFavorite(productId);
      Swal.fire({
        icon: "success",
        title: "Removed from Favorites",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        text: "Item removed from favorites.",
      });
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        text: "Failed to remove from favorites.",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading favorites...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
      <div className="max-w-6xl mx-auto p-6 ">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">❤️</span>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            My Favorites
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {favoriteProducts.length} items
          </span>
        </div>

        {favoriteProducts.length === 0 ? (
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
            {favoriteProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-lg p-4 shadow-md transition-shadow"
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

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.stock}/{product.unit} left
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition bg-blue-600 hover:bg-blue-700 text-white`}
                      >
                        🛒 Add to Cart
                      </button>

                      {/* Favorite Toggle */}
                      <button
                        onClick={() => handleRemoveFromFavorites(product._id)}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition 
      bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 
      hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-500"
                        title="Remove from Favorites"
                      >
                        ❤️ Remove from Favorites
                      </button>

                      {/* View Details Link */}
                      <Link
                        href={`/products/${product._id}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition 
      bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 
      hover:bg-blue-50 dark:hover:bg-gray-800 hover:underline"
                      >
                        🔍 View Details
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
