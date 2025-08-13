"use client";

import Loading from "@/app/(main)/products/Loading";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCartStore } from "@/stores/cartStore";
import { FaArrowRight, FaHeart, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

export const FeaturedProduct = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState({});

    const { favorites, toggleFavorite, setFavorites } = useFavoriteStore();
    const { addToCart, setCart, cart } = useCartStore();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch products
                const res = await fetch("/api/products", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const products = await res.json();

                // Sort by sales count or created date
                const sorted = products.some((p) => p.salesCount > 0)
                    ? [...products].sort((a, b) => b.salesCount - a.salesCount)
                    : [...products].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );

                setFeaturedProducts(sorted.filter((p) => p.stock > 0).slice(0, 8));

                // Fetch favorites
                const favoritesRes = await fetch("/api/favorites");
                if (!favoritesRes.ok) throw new Error("Failed to fetch favorites");
                const favoritesData = await favoritesRes.json();
                setFavorites(favoritesData.map((id) => id.toString()));

                // Fetch cart
                const cartRes = await fetch("/api/cart");
                if (cartRes.ok) {
                    const cartData = await cartRes.json();
                    setCart(cartData);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load featured products or favorites");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [setFavorites, setCart]);

    const handleToggleFavorite = async (productId) => {
        try {
            await toggleFavorite(productId);
        } catch (err) {
            console.error("Failed to update favorite:", err);
        }
    };

    const handleAddToCart = (product) => {
        const cartItem = cart.find((item) => item.product._id.toString() === product._id.toString());
        if (cartItem && cartItem.quantity >= product.stock) {
            Swal.fire({
                icon: "error",
                title: "Stock Limit Reached",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                text: `Cannot add more ${product.productName}. Only ${product.stock} ${product.unit} available.`,
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

    if (error)
        return <div className="text-center py-16 text-red-500">{error}</div>;
    if (loading) return <Loading />;

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Featured Products
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fresh picks from our local farmers
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center"
                        aria-label="View all products"
                    >
                        View All <FaArrowRight className="ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => {
                        const isFavorite = favorites.includes(product._id.toString());
                        const isInCart = cart.some(
                            (item) => item.product._id.toString() === product._id.toString()
                        );

                        return (
                            <div
                                key={product._id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative">
                                    <Image
                                        width={400}
                                        height={300}
                                        src={
                                            imageError[product._id]
                                                ? "/fallback-image.jpg"
                                                : product.images[0] || "/fallback-image.jpg"
                                        }
                                        alt={product.productName}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={() =>
                                            setImageError((prev) => ({ ...prev, [product._id]: true }))
                                        }
                                    />
                                    {product.features?.includes("organic") && (
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                Organic
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => handleToggleFavorite(product._id)}
                                            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            aria-label={
                                                isFavorite
                                                    ? "Remove from favorites"
                                                    : "Add to favorites"
                                            }
                                        >
                                            <FaHeart
                                                className={
                                                    isFavorite
                                                        ? "text-red-500"
                                                        : "text-gray-600 dark:text-gray-400"
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Link
                                            href={`/products/${product._id}`}
                                            aria-label={`View ${product.productName}`}
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {product.productName}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center text-yellow-400">
                                            <FaStar className="text-sm" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                                {product.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        By {product.farmer?.firstName} {product.farmer?.lastName} •{" "}
                                        {product.farmLocation}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                ৳{product.price}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                /{product.unit}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Stock: {product.stock} {product.unit}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isInCart}
                                        className={`w-full py-2 rounded-lg font-medium transition ${isInCart
                                            ? "bg-gray-400 dark:bg-gray-600 text-gray-100 cursor-not-allowed"
                                            : "bg-primary-500 hover:bg-emerald-700 text-white"
                                            }`}
                                        aria-label={isInCart ? `${product.productName} is already in cart` : `Add ${product.productName} to cart`}
                                    >
                                        {isInCart ? "In Cart" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};