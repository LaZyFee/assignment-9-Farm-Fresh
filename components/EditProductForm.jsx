/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProductForm({ productId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    price: "",
    unit: "",
    stock: "",
    farmLocation: "",
    harvestDate: "",
    features: [],
    images: [],
  });
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const product = await res.json();
      setFormData({
        ...product,
        harvestDate: product.harvestDate
          ? new Date(product.harvestDate).toISOString().split("T")[0]
          : "",
      });
      setLoading(false);
    } catch (err) {
      alert("Failed to load product");
      router.push("/manage-products");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        features: checked
          ? [...prev.features, value]
          : prev.features.filter((f) => f !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      alert("Max 5 images total");
      return;
    }
    setNewImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "features") {
        value.forEach((f) => submitData.append("features[]", f));
      } else if (key !== "images") {
        submitData.append(key, value);
      }
    });
    newImages.forEach((img) => submitData.append("images", img));

    try {
      const res = await fetch(`/api/my-products?id=${productId}`, {
        method: "PATCH",
        body: submitData,
      });
      if (!res.ok) throw new Error("Failed to update");
      alert("Product updated!");
      router.push("/manage-products");
    } catch (err) {
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const inputClasses =
    "w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white px-8 py-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-primary-100 mt-2">
            Update your fresh produce details
          </p>
        </div>

        {/* Form */}
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="e.g., Organic Tomatoes"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                >
                  <option value="">Select Category</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="herbs">Herbs</option>
                  <option value="honey">Honey</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="Describe your product"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Price per Unit (৳) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="45.00"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="piece">Piece</option>
                  <option value="liter">Liter</option>
                  <option value="dozen">Dozen</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Available Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Product Images
            </h2>
            {/* Existing images previews */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {formData.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`existing-${idx}`}
                    width={200}
                    height={200}
                    className="object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            {/* Input for new images (appended to existing) */}
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Farm Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Farm Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Farm Location *
                </label>
                <input
                  type="text"
                  name="farmLocation"
                  value={formData.farmLocation}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="e.g., Sylhet, Bangladesh"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-800 dark:text-gray-200">
                  Harvest Date
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Product Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "organic",
                "pesticide-free",
                "fresh",
                "non-gmo",
                "local",
                "sustainable",
                "fair-trade",
                "gluten-free",
              ].map((feature) => (
                <label
                  key={feature}
                  className="flex items-center p-3 border rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                >
                  <input
                    type="checkbox"
                    name="features[]"
                    value={feature}
                    checked={formData.features.includes(feature)}
                    onChange={handleChange}
                    className="accent-primary-600"
                  />
                  <span className="ml-2 text-sm capitalize">
                    {feature.replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
