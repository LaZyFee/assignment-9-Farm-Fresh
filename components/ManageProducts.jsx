// D:\NextJs\Assignmnets\assignment-9\components\ManageProducts.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/my-products?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      setCurrentPage(1); // Reset to page 1 on new fetch
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchProducts({ search, category, status: statusFilter });
  };

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
    if (product.status === "inactive") return "Inactive";
    if (product.stock === 0) return "Out of Stock";
    if (product.stock < 10) return "Low Stock";
    return "Active";
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-800";
    if (status === "Inactive") return "bg-gray-100 text-gray-800";
    if (status === "Out of Stock") return "bg-red-100 text-red-800";
    if (status === "Low Stock") return "bg-yellow-100 text-yellow-800";
  };

  const inputClasses =
    "w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Manage Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your product listings and inventory
        </p>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Link href="/add-product">
          <button className="bg-primary-600 text-white px-4 py-2 rounded mb-6 hover:bg-primary-700 transition">
            Add New Product
          </button>
        </Link>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses}
          >
            <option>All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClasses}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Out of Stock</option>
            <option>Low Stock</option>
          </select>
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Product List */}
        {currentProducts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No products found. Try adjusting your filters or adding a new
            product.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => {
              const status = getStatus(product);
              return (
                <div
                  key={product._id}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <span
                    className={`${getStatusColor(
                      status
                    )} px-2 py-1 rounded text-sm font-semibold`}
                  >
                    {status}
                  </span>
                  <Image
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.productName}
                    width={200}
                    height={200}
                    className="object-cover rounded-lg mt-2"
                  />
                  <h3 className="font-bold text-lg mt-2 text-gray-900 dark:text-gray-100">
                    {product.productName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.rating || "N/A"} ({product.reviewsCount || 0})
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {product.features?.includes("organic") ? "Organic • " : ""}
                    {product.category}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    ৳{product.price}/{product.unit}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Stock: {product.stock}
                    {product.unit}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/edit-product/${product._id}`}>
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() =>
                        handleToggleStatus(product._id, product.status)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      {product.status === "active" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
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
    </div>
  );
}
