"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import Error from "./Error";
import Loading from "./Loading";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCartStore } from "@/stores/cartStore";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

export default function ProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const keywordParam = searchParams.get("keyword") || "";
    const categoryParam = searchParams.get("category") || "";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState({});
    const [filters, setFilters] = useState({
        category: categoryParam ? [categoryParam.toLowerCase()] : [],
        priceRange: [],
        location: "",
        organic: false,
    });
    const [keyword, setKeyword] = useState(keywordParam);
    const [category, setCategory] = useState(
        categoryParam ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : "All Categories"
    );
    const [sortOption, setSortOption] = useState("featured");
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState(["All Categories"]);
    const [inputValue, setInputValue] = useState(keywordParam);
    const productsPerPage = 6;

    const { favorites, toggleFavorite, setFavorites } = useFavoriteStore();
    const cart = useCartStore((state) => state.cart);
    const addToCart = useCartStore((state) => state.addToCart);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const clearCart = useCartStore((state) => state.clearCart);
    const farmer = session?.user?.userType === "farmer";

    const debouncedSetKeyword = debounce((value) => {
        setKeyword(value);
    }, 300);

    useEffect(() => {
        setInputValue(keywordParam);
    }, [keywordParam]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch products
                const res = await fetch("/api/products", { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);

                // Group categories and count
                const categoryMap = {};
                const locationSet = new Set();
                data.forEach((product) => {
                    categoryMap[product.category.toLowerCase()] =
                        (categoryMap[product.category.toLowerCase()] || 0) + 1;
                    if (product.farmLocation) {
                        const city = product.farmLocation.split(",")[0].trim();
                        locationSet.add(city);
                    }
                });

                setCategoryCounts(
                    Object.entries(categoryMap).map(([label, count]) => ({
                        label,
                        count,
                    })) || [{ label: "No categories", count: 0 }]
                );

                const uniqueCategories = Array.from(
                    new Set(data.map((product) => product.category.toLowerCase()))
                );
                const formattedCategories = uniqueCategories.map(
                    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
                );
                setCategories(["All Categories", ...formattedCategories]);
                setLocations(Array.from(locationSet));

                // Fetch favorites
                const favoritesRes = await fetch("/api/favorites");
                if (!favoritesRes.ok) throw new Error("Failed to fetch favorites");
                const favoritesData = await favoritesRes.json();
                setFavorites(favoritesData.map((id) => id.toString()));

                // Fetch cart using Zustand
                await fetchCart();
            } catch (err) {
                console.error("Fetch error:", err);
                setError(`Failed to load products: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [setFavorites, fetchCart]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSetKeyword(value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let url = "/products";
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (category !== "All Categories") params.append("category", category.toLowerCase());
        if (params.toString()) url += `?${params.toString()}`;
        router.push(url);
        setCurrentPage(1);
    };

    const handleToggleFavorite = async (productId) => {
        try {
            await toggleFavorite(productId);
        } catch (err) {
            console.error("Failed to update favorite:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                text: "Failed to update favorite. Please try again.",
            });
        }
    };

    const handleAddToCart = async (product) => {
        // Check if user is farmer first
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

        try {
            await addToCart({ product, quantity: 1 });

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
        } catch (err) {
            console.error("Failed to add to cart:", err);

            // Show appropriate error message
            const errorMessage = err.message || "Failed to add to cart.";

            Swal.fire({
                icon: "error",
                title: "Cannot Add to Cart",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                text: errorMessage,
            });
        }
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
            const matchesKeyword =
                !keyword || product.productName.toLowerCase().includes(keyword.toLowerCase());
            const matchesCategory =
                filters.category.length === 0 ||
                filters.category.includes(product.category.toLowerCase());
            const matchesPrice =
                filters.priceRange.length === 0 ||
                filters.priceRange.some((range) => {
                    if (range === "Under ৳30") return product.price < 30;
                    if (range === "৳30 - ৳50") return product.price >= 30 && product.price <= 50;
                    if (range === "৳50 - ৳100") return product.price > 50 && product.price <= 100;
                    if (range === "Over ৳100") return product.price > 100;
                    return true;
                });
            const matchesLocation =
                !filters.location ||
                product.farmLocation?.split(",")[0]?.trim().toLowerCase().includes(filters.location.toLowerCase());
            const matchesOrganic = !filters.organic || product.features?.includes("organic");
            return (
                matchesKeyword &&
                matchesCategory &&
                matchesPrice &&
                matchesLocation &&
                matchesOrganic
            );
        })
        .sort((a, b) => {
            if (sortOption === "price-low-high") return a.price - b.price;
            if (sortOption === "price-high-low") return b.price - a.price;
            if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOption === "rating") return b.rating - a.rating;
            return 0;
        });

    const totalProducts = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));
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
                <div className="bg-primary-600 text-white py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold mb-4">Fresh Products</h1>
                        <p className="text-xl text-primary-100 mb-6">
                            Discover fresh, locally-sourced produce from our trusted farmers
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    <aside className="lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm h-fit">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Filters
                        </h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Category
                            </h3>
                            {categoryCounts.map((category) => (
                                <label
                                    key={category.label}
                                    className="flex items-center mb-2"
                                    aria-label={`Filter by ${category.label}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.category.includes(category.label)}
                                        onChange={() => handleFilterChange("category", category.label)}
                                        className="mr-2"
                                        aria-label={`Toggle ${category.label} category`}
                                    />
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {category.label.charAt(0).toUpperCase() + category.label.slice(1)} (
                                        {category.count})
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Price Range
                            </h3>
                            {["Under ৳30", "৳30 - ৳50", "৳50 - ৳100", "Over ৳100"].map((range) => (
                                <label
                                    key={range}
                                    className="flex items-center mb-2"
                                    aria-label={`Filter by ${range}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.priceRange.includes(range)}
                                        onChange={() => handleFilterChange("priceRange", range)}
                                        className="mr-2"
                                        aria-label={`Toggle ${range} price range`}
                                    />
                                    <span className="text-gray-600 dark:text-gray-300">{range}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Location
                            </h3>
                            <select
                                value={filters.location}
                                onChange={(e) => handleFilterChange("location", e.target.value)}
                                className="w-full p-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                aria-label="Select location filter"
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
                            <label className="flex items-center" aria-label="Filter by organic products">
                                <input
                                    type="checkbox"
                                    checked={filters.organic}
                                    onChange={() => handleFilterChange("organic", null)}
                                    className="mr-2"
                                    aria-label="Toggle organic products filter"
                                />
                                <span className="text-gray-600 dark:text-gray-300">Organic Only</span>
                            </label>
                        </div>
                    </aside>
                    <div className="lg:w-3/4">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <p className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Showing {(currentPage - 1) * productsPerPage + 1}-
                                {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                            </p>

                            <div className="flex-1 min-w-[250px]">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex rounded-lg overflow-hidden shadow-lg"
                                    autoComplete="off"
                                    aria-label="Search products"
                                >
                                    <input
                                        type="text"
                                        id="search-input"
                                        placeholder="Search for vegetables, fruits, farmers..."
                                        className="flex-1 px-6 py-3 text-gray-900 text-lg focus:outline-none"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        aria-label="Search keyword"
                                    />
                                    <button
                                        className="bg-primary-700 hover:bg-primary-800 px-6 py-3 transition"
                                        aria-label="Search"
                                    >
                                        <FaSearch />
                                    </button>
                                </form>
                            </div>

                            <div className="flex items-center whitespace-nowrap">
                                <label
                                    className="text-gray-600 dark:text-gray-400 mr-2"
                                    htmlFor="sort"
                                >
                                    Sort by:
                                </label>
                                <select
                                    id="sort"
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    aria-label="Sort products"
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
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    We couldn't find any products matching your filters.
                                </p>
                                <Link
                                    href="/products"
                                    onClick={() => {
                                        setFilters({
                                            category: [],
                                            priceRange: [],
                                            location: "",
                                            organic: false,
                                        });
                                        setKeyword("");
                                        setCategory("All Categories");
                                        setSortOption("featured");
                                        setCurrentPage(1);
                                    }}
                                    className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                                    aria-label="View all products"
                                >
                                    View All Products
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProducts.map((product) => {
                                    const isFavorite = favorites.includes(product._id.toString());
                                    const isInCart = cart.some(
                                        (item) => item.product._id.toString() === product._id.toString()
                                    );

                                    return (
                                        <div
                                            key={product._id}
                                            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="relative overflow-hidden">
                                                {product.images?.[0] ? (
                                                    <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                                                        <Image
                                                            src={imageError[product._id] ? "/fallback-image.jpg" : product.images[0]}
                                                            alt={product.productName}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={() =>
                                                                setImageError((prev) => ({ ...prev, [product._id]: true }))
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <span className="text-4xl text-gray-400 dark:text-gray-500 mb-2 block">
                                                                📷
                                                            </span>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                No Image
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {product.features?.includes("organic") && (
                                                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                                                        Organic
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleToggleFavorite(product._id)}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 shadow-md"
                                                    aria-label={
                                                        isFavorite
                                                            ? "Remove from favorites"
                                                            : "Add to favorites"
                                                    }
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 ${isFavorite
                                                            ? "text-red-500 fill-red-500"
                                                            : "text-gray-600 dark:text-gray-300"
                                                            } transition-colors duration-200`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                    {product.productName}
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    By{" "}
                                                    {product.farmer
                                                        ? `${product.farmer.firstName} ${product.farmer.lastName} `
                                                        : "Unknown Farmer"}
                                                    • {product.farmLocation}
                                                </p>
                                                <div className="flex items-center gap-1 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-gray-300 dark:text-gray-600"
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
                                                        Stock: {product.stock} {product.unit}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={isInCart}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isInCart
                                                            ? "bg-gray-400 dark:bg-gray-600 text-gray-100 cursor-not-allowed"
                                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            }`}
                                                        aria-label={
                                                            isInCart
                                                                ? `${product.productName} is already in cart`
                                                                : `Add ${product.productName} to cart`
                                                        }
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                        {isInCart ? "In Cart" : "Add to Cart"}
                                                    </button>
                                                    <Link
                                                        href={`/products/${product._id}`}
                                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                                        aria-label={`View ${product.productName}`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 rounded ${currentPage === i + 1
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}
                                    aria-label={`Page ${i + 1}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                                aria-label="Next page"
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