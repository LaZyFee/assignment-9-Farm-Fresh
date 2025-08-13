"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaHeart, FaStar } from "react-icons/fa";

function RelatedProduct({ product }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : [];

        // Filter related products excluding the current product
        const related = allProducts.filter(
          (p) => p.category === product.category && p._id !== product._id
        );

        setRelatedProducts(related.slice(0, 4));
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    if (product?.category) {
      fetchProducts();
    }
  }, [product]);

  if (loading) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        Loading related products...
      </p>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <div className="mt-16 mx-auto max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Related Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((related) => (
          <Link
            href={`/products/${related._id}`}
            key={related._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="relative">
              <Image
                src={related.images?.[0] || "/placeholder.jpg"}
                alt={related.productName}
                width={400}
                height={300}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {related.features?.includes("organic") && (
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Organic
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <FaHeart className=" text-gray-600 dark:text-gray-400"></FaHeart>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {related.productName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                By{" "}
                {related.farmer.firstName + " " + related.farmer.lastName ||
                  "Unknown Farmer"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ৳{related.price}/{related.unit}
                </span>
                <div className="flex items-center text-yellow-400 text-sm">
                  <FaStar className=""></FaStar>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    {related.rating || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProduct;
