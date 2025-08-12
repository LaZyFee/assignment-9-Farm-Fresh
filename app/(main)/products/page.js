"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import Error from "./Error";
import Loading from "./Loading";
import levenshtein from "@/helper/levenshtein";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [cart, setCart] = useState(new Set());
    const [filters, setFilters] = useState({
        category: [],
        priceRange: [],
        location: "",
        organic: false,
    });
    const [sortOption, setSortOption] = useState("featured");
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [locations, setLocations] = useState([]);
    const productsPerPage = 12;



    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();

                setProducts(Array.isArray(data) ? data : []);

                // Group categories and count
                const categoryMap = {};
                const locationSet = new Set();

                data.forEach(product => {
                    // Category count
                    categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;

                    // Location list (city only)
                    if (product.farmLocation) {
                        const city = product.farmLocation.split(",")[0].trim();
                        locationSet.add(city);
                    }
                });

                // Convert category map to array for rendering
                setCategoryCounts(
                    Object.entries(categoryMap).map(([label, count]) => ({
                        label,
                        count,
                    }))
                );

                // Convert locations to array
                setLocations(Array.from(locationSet));

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
        setFavorites((prev) => {
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
        setCart((prev) => {
            const newCart = new Set(prev);
            if (newCart.has(productId)) {
                newCart.delete(productId);
            } else {
                newCart.add(productId);
            }
            return newCart;
        });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => {
            if (filterType === "category" || filterType === "priceRange") {
                const updatedArray = prev[filterType].includes(value)
                    ? prev[filterType].filter((item) => item !== value)
                    : [...prev[filterType], value];
                return { ...prev, [filterType]: updatedArray };
            } else if (filterType === "location") {
                return { ...prev, location: prev.location === value ? "" : value };
            } else if (filterType === "organic") {
                return { ...prev, organic: !prev.organic };
            }
            return prev;
        });
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = products
        .filter((product) => {
            const matchesCategory =
                filters.category.length === 0 ||
                filters.category.includes(product.category);
            const matchesPrice = filters.priceRange.length === 0 || filters.priceRange.some((range) => {
                if (range === "Under ৳30") return product.price < 30;
                if (range === "৳30 - ৳50") return product.price >= 30 && product.price <= 50;
                if (range === "৳50 - ৳100") return product.price > 50 && product.price <= 100;
                if (range === "Over ৳100") return product.price > 100;
                return true;
            });
            const matchesLocation =
                !filters.location ||
                levenshtein(
                    product.farmLocation.split(",")[0].trim().toLowerCase(),
                    filters.location.trim().toLowerCase()
                ) <= 2;


            const matchesOrganic = !filters.organic || product.features.includes("organic");
            return matchesCategory && matchesPrice && matchesLocation && matchesOrganic;
        })
        .sort((a, b) => {
            if (sortOption === "price-low-high") return a.price - b.price;
            if (sortOption === "price-high-low") return b.price - a.price;
            if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOption === "rating") return b.rating - a.rating;
            return 0;
        });

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    if (error) {
        return <Error error={error} />;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div class="bg-primary-600 text-white py-12">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 class="text-4xl font-bold mb-4">Fresh Products</h1>
                        <p class="text-xl text-primary-100">
                            Discover fresh, locally-sourced produce from our trusted farmers
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    <aside className="lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Category</h3>
                            {categoryCounts.map((category) => (
                                <label key={category.label} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.category.includes(category.label)}
                                        onChange={() => handleFilterChange("category", category.label)}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {category.label.charAt(0).toUpperCase() + category.label.slice(1)} ({category.count})
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Price Range</h3>
                            {["Under ৳30", "৳30 - ৳50", "৳50 - ৳100", "Over ৳100"].map((range) => (
                                <label key={range} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.priceRange.includes(range)}
                                        onChange={() => handleFilterChange("priceRange", range)}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-600 dark:text-gray-300">{range}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Location</h3>
                            <select
                                value={filters.location}
                                onChange={(e) => handleFilterChange("location", e.target.value)}
                                className="w-full p-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">All Locations</option>
                                {locations.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.organic}
                                    onChange={() => handleFilterChange("organic", null)}
                                    className="mr-2"
                                />
                                <span className="text-gray-600 dark:text-gray-300">Organic Only</span>
                            </label>
                        </div>
                        <button
                            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            onClick={() => console.log("Filters applied:", filters)}
                        >
                            Apply Filters
                        </button>
                    </aside>
                    <div className="lg:w-3/4">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Showing {(currentPage - 1) * productsPerPage + 1}-
                                {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                            </p>
                            <div>
                                <label className="text-gray-600 dark:text-gray-400 mr-2">Sort by:</label>
                                <select
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low-high">Price: Low to High</option>
                                    <option value="price-high-low">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                    <option value="rating">Rating</option>
                                </select>
                            </div>
                        </div>
                        {paginatedProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-gray-400 dark:text-gray-500">📦</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    No Products Found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    We couldn't find any products matching your filters.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.productName}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = "/fallback-image.jpg";
                                                        }}
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
                                            {product.features.includes("organic") && (
                                                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Organic</span>
                                            )}
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
                                        <div className="p-5">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {product.productName}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                By {product.farmer
                                                    ? `${product.farmer.firstName} ${product.farmer.lastName} `
                                                    : "Unknown Farmer"}
                                                • {product.farmLocation}
                                            </p>
                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                                    ({product.rating})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        ৳{product.price}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                                        / {product.unit}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    Stock: {product.stock}kg
                                                </span>
                                            </div>
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
                                                    {cart.has(product._id) ? 'Added' : 'Add to Cart'}
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
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 rounded ${currentPage === i + 1
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}