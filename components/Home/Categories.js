/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { FaLeaf, FaSeedling } from "react-icons/fa";
import { FaApple, FaCarrot, FaCheese, FaJar } from "react-icons/fa6";
import Link from "next/link";

export const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryStyles = {
        vegetables: {
            icon: <FaCarrot className="text-4xl text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800",
        },
        fruits: {
            icon: <FaApple className="text-4xl text-red-600 dark:text-red-400" />,
            bg: "bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800",
        },
        grains: {
            icon: <FaSeedling className="text-4xl text-yellow-600 dark:text-yellow-400" />,
            bg: "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800",
        },
        dairy: {
            icon: <FaCheese className="text-4xl text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800",
        },
        honey: {
            icon: <FaJar className="text-4xl text-purple-600 dark:text-purple-400" />,
            bg: "bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800",
        },
        herbs: {
            icon: <FaLeaf className="text-4xl text-orange-600 dark:text-orange-400" />,
            bg: "bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800",
        },
    };

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                const res = await fetch("/api/products", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();
                const categoryMap = {};
                data.forEach((product) => {
                    const category = product.category.toLowerCase();
                    categoryMap[category] = (categoryMap[category] || 0) + 1;
                });
                setCategories(
                    Object.entries(categoryMap).map(([name, count]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        count: `${count}+ items`,
                        icon: categoryStyles[name]?.icon || (
                            <FaLeaf className="text-4xl text-gray-600 dark:text-gray-400" />
                        ),
                        bg:
                            categoryStyles[name]?.bg ||
                            "bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800",
                    }))
                );
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
    if (loading) return <div className="text-center py-16">Loading...</div>;

    return (
        <section className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover fresh, locally-sourced produce across various categories
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            href={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                            aria-label={`Shop ${cat.name} category`}
                        >
                            <div
                                className={`group cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center h-40 transition transform hover:scale-105 shadow-sm hover:shadow-lg ${cat.bg}`}
                            >
                                <div className="mb-3">{cat.icon}</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {cat.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{cat.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};