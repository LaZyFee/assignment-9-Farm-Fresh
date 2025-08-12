import React from "react";
import { FaLeaf, FaSeedling } from "react-icons/fa";
import { FaApple, FaCarrot, FaCheese, FaJar } from "react-icons/fa6";

export const Categories = () => {
    const categories = [
        {
            icon: <FaCarrot className="text-4xl text-green-600 dark:text-green-400" />,
            name: "Vegetables",
            count: "150+ items",
            bg: "green",
        },
        {
            icon: <FaApple className="text-4xl text-red-600 dark:text-red-400" />,
            name: "Fruits",
            count: "80+ items",
            bg: "red",
        },
        {
            icon: <FaSeedling className="text-4xl text-yellow-600 dark:text-yellow-400" />,
            name: "Grains",
            count: "45+ items",
            bg: "yellow",
        },
        {
            icon: <FaCheese className="text-4xl text-blue-600 dark:text-blue-400" />,
            name: "Dairy",
            count: "25+ items",
            bg: "blue",
        },
        {
            icon: <FaJar className="text-4xl text-purple-600 dark:text-purple-400" />,
            name: "Honey",
            count: "15+ items",
            bg: "red",
        },
        {
            icon: <FaLeaf className="text-4xl text-orange-600 dark:text-orange-400" />,
            name: "Herbs",
            count: "30+ items",
            bg: "green",
        },
    ];

    return (
        <section className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover fresh, locally-sourced produce across various categories
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            className={`group cursor-pointer bg-${cat.bg}-100 dark:bg-${cat.bg}-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[160px] hover:bg-${cat.bg}-200 dark:hover:bg-${cat.bg}-800 transition transform hover:scale-105 shadow-sm hover:shadow-lg`}
                        >
                            <div className="mb-3">{cat.icon}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {cat.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {cat.count}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
