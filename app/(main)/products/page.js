"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import Error from "./Error";
import Loading from "./Loading";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [cart, setCart] = useState(new Set());

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products", {
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(`Failed to load products: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const toggleFavorite = (productId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    };

    const toggleCart = (productId) => {
        setCart(prev => {
            const newCart = new Set(prev);
            if (newCart.has(productId)) {
                newCart.delete(productId);
            } else {
                newCart.add(productId);
            }
            return newCart;
        });
    };

    if (error) {
        return <Error error={error} />;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Our Products
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Discover our amazing collection of products
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-gray-400 dark:text-gray-500">📦</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No Products Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            We couldn't find any products at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                {/* Product Image */}
                                <div className="relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.productName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-4xl text-gray-400 dark:text-gray-500 mb-2 block">📷</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">No Image</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Favorite Button Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleFavorite(product._id);
                                        }}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 shadow-md"
                                        aria-label={favorites.has(product._id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${favorites.has(product._id)
                                                ? 'text-red-500 fill-red-500'
                                                : 'text-gray-600 dark:text-gray-300'
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {product.productName}
                                    </h2>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                        {product.description}
                                    </p>

                                    {/* Rating placeholder - you can replace with actual rating */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < 4
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(4.0)</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                ৳{product.price}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                                / {product.unit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleCart(product._id);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${cart.has(product._id)
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                }`}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            {cart.has(product._id) ? 'Added' : 'Cart'}
                                        </button>

                                        <Link
                                            href={`/products/${product._id}`}
                                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}