"use client";

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { debounceSearch } from "@/helper/debounceSearch";

export const Hero = () => {
    const [inputValue, setInputValue] = useState("");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["All Categories"]);
    const [category, setCategory] = useState("All Categories");
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState({});
    const router = useRouter();

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        debounceSearch(value, category, products, setSuggestions);
    };

    const handleCategoryChange = (e) => {
        const selected = e.target.value;
        setCategory(selected);
        debounceSearch(inputValue, selected, products, setSuggestions);
    };

    // Fetch products on mount
    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const res = await fetch("/api/products", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();
                setProducts(data);

                const uniqueCategories = Array.from(
                    new Set(data.map((product) => product.category.toLowerCase()))
                );
                const formattedCategories = uniqueCategories.map(
                    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
                );
                setCategories(["All Categories", ...formattedCategories]);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        let url = "/products";
        const params = new URLSearchParams();
        if (inputValue) params.append("keyword", inputValue);
        if (category !== "All Categories")
            params.append("category", category.toLowerCase());
        if (params.toString()) url += `?${params.toString()}`;
        router.push(url);
    };

    if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

    return (
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Fresh from Farm to Your Table
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-emerald-100 max-w-3xl mx-auto">
                        Connect directly with local farmers and get the freshest produce delivered to
                        your doorstep
                    </p>

                    {/* Search Form */}
                    <div className="max-w-2xl mx-auto mb-8 relative">
                        <form
                            onSubmit={handleSearch}
                            className="flex rounded-lg overflow-hidden shadow-lg"
                            autoComplete="off"
                            aria-label="Search products"
                        >
                            <input
                                type="text"
                                placeholder="Search for vegetables, fruits, farmers..."
                                className="flex-1 px-6 py-3 text-gray-900 text-lg focus:outline-none"
                                value={inputValue}
                                onChange={handleInputChange}
                                aria-label="Search keyword"
                            />
                            <select
                                className="px-4 py-4 text-gray-900 border-l border-gray-300 focus:outline-none"
                                value={category}
                                onChange={handleCategoryChange}
                                aria-label="Select category"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-primary-700 hover:bg-primary-800 px-8 py-4 transition"
                                aria-label="Search"
                            >
                                <FaSearch />
                            </button>
                        </form>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-20 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                {suggestions.map((product) => (
                                    <Link
                                        href={`/products/${product._id}`}
                                        key={product._id}
                                        className="flex items-center gap-6 p-4 cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        aria-label={`View ${product.productName}`}
                                    >
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                            <Image
                                                src={
                                                    imageError[product._id]
                                                        ? "/fallback-image.jpg"
                                                        : product.images[0] || "/fallback-image.jpg"
                                                }
                                                alt={product.productName}
                                                fill
                                                sizes="80px"
                                                className="object-cover rounded-full"
                                                onError={() =>
                                                    setImageError((prev) => ({
                                                        ...prev,
                                                        [product._id]: true
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="inline-block text-xs px-2 py-1 rounded-full mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white w-max">
                                                {product.category.charAt(0).toUpperCase() +
                                                    product.category.slice(1)}
                                            </span>
                                            <h3 className="text-lg font-extrabold truncate dark:text-white text-gray-900">
                                                {product.productName}
                                            </h3>
                                        </div>
                                        <div className="flex-shrink-0 w-36 text-right">
                                            <h3 className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                                                ৳{product.price}/{product.unit}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold">500+</div>
                            <div className="text-emerald-200">Local Farmers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">2000+</div>
                            <div className="text-emerald-200">Fresh Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">10k+</div>
                            <div className="text-emerald-200 whitespace-nowrap">
                                Happy Customers
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};
