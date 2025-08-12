/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { FiHeart, FiStar } from "react-icons/fi";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
} from "react-icons/fa";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters whenever search, category, or statusFilter changes
  useEffect(() => {
    applyFilters();
  }, [search, category, statusFilter, products]);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (filters.search && filters.search.trim()) {
        params.append("search", filters.search.trim());
      }
      if (filters.category && filters.category !== "All Categories") {
        params.append("category", filters.category);
      }
      if (filters.status && filters.status !== "All Status") {
        params.append("status", filters.status);
      }

      const res = await fetch(`/api/my-products?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (category && category !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "All Status") {
      filtered = filtered.filter((product) => {
        const productStatus = getStatus(product);
        return productStatus === statusFilter;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleFilter = () => {
    fetchProducts({ search, category, status: statusFilter });
  };
  const uniqueCategories = [
    "All Categories",
    ...Array.from(new Set(products.map((p) => p.category))).sort(),
  ];
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/my-products?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to delete");
      }
      // Refresh products after deletion
      fetchProducts({ search, category, status: statusFilter });
    } catch (err) {
      setError("Failed to delete product: " + err.message);
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append("action", "toggle");
      const res = await fetch(`/api/my-products?id=${id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to toggle status");
      }
      fetchProducts({ search, category, status: statusFilter });
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };
  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getStatus = (product) => {
    if (product.status?.toLowerCase() === "inactive") return "Inactive";

    if (product.status?.toLowerCase() === "active") {
      if (product.stock === 0) return "Out of Stock";
      if (product.stock <= 10) return "Low Stock";
      return "Active";
    }

    return "Active";
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "bg-green-500 text-white";
    if (status === "Inactive") return "bg-gray-600 text-white";
    if (status === "Out of Stock") return "bg-red-500 text-white";
    if (status === "Low Stock") return "bg-yellow-500 text-white";
  };

  const inputClasses =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
          </li>
          <li>
            <FaChevronRight className=" text-gray-400 text-xs"></FaChevronRight>
          </li>
          <li className="text-gray-900 dark:text-white">Manage Products</li>
        </ol>
      </nav>
      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your product listings and inventory
          </p>
        </div>
        <Link href="/add-product">
          <button className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition">
            <FaPlus className="mr-2" />
            Add New Product
          </button>
        </Link>
      </div>
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      {/*  filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400"></FaSearch>
            </div>
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClasses}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
              onClick={handleFilter}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      {/* Product List */}
      {currentProducts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No products found. Try adjusting your filters or adding a new product.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => {
            const status = getStatus(product);
            return (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Image & Status + Heart Icon */}
                <div className="relative">
                  <Image
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.productName}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`${getStatusColor(
                        status
                      )} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {status}
                    </span>
                  </div>
                  {/* Wishlist / Heart Button */}
                  <div className="absolute top-3 right-3">
                    <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <FiHeart className="w-6 h-6 text-red-500" />{" "}
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Title & Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.productName}
                    </h3>
                    <div className="flex items-center text-yellow-400">
                      <FiStar className="w-6 h-6 text-yellow-400" />{" "}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {product.rating || 0} ({product.reviewsCount || 0})
                      </span>
                    </div>
                  </div>

                  {/* Category / Features */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {product.features?.includes("organic") ? "Organic • " : ""}
                    {product.category}
                  </p>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ৳{product.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{product.unit}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Stock: {product.stock}
                      {product.unit}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-2">
                    {/* Edit */}
                    <Link
                      href={`/edit-product/${product._id}`}
                      className="flex-1"
                    >
                      <button className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition text-sm">
                        <FaEdit className=" mr-1"></FaEdit>Edit
                      </button>
                    </Link>

                    {/* View */}
                    <Link
                      href={`/products/${product._id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <FaEye className=""></FaEye>
                    </Link>
                    {/* active/inactive */}
                    <button
                      onClick={() =>
                        handleToggleStatus(product._id, product.status)
                      }
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      {product.status.toLowerCase() === "active" ? (
                        <FaToggleOn className="text-green-500"></FaToggleOn>
                      ) : (
                        <FaToggleOff className="text-red-500"></FaToggleOff>
                      )}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                    >
                      <FaTrash className=""></FaTrash>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 ${
                currentPage === i + 1
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
              } rounded mx-1 hover:bg-primary-500 hover:text-white transition`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
