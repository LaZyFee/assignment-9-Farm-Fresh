"use client";
import Image from "next/image";
import { useState } from "react";

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${product.reviewsCount || 0})` },
    { id: "farmer", label: "Farmer Info" },
  ];

  return (
    <div className="mt-16 max-w-6xl mx-auto">
      {/* Enhanced Tabs Navigation */}
      <div className="relative border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Tab Content */}
      <div className="py-8">
        {activeTab === "description" && (
          <div className="space-y-8">
            {/* Product Overview Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Product
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
              {/* Product Details Grid */}
              {product.features?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    Key Features
                  </h4>
                  {product.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      <span className="capitalize text-gray-700 dark:text-gray-300 font-medium mb-2">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="text-center py-12">
            <div className="rounded-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Customer Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This product has {product.reviewsCount || 0} review
                {product.reviewsCount === 1 ? "" : "s"} with an average rating
                of{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {product.rating}/5 stars
                </span>
              </p>
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < product.rating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "farmer" && product.farmer && (
          <div className="space-y-6">
            {/* Farmer Profile Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 border border-amber-200 dark:border-amber-700/50">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Image
                    src={product.farmer.profilePicture}
                    alt={`${product.farmer.firstName} ${product.farmer.lastName}`}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Verified
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.farmer.firstName} {product.farmer.lastName}
                  </h3>
                  <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-2">
                    {product.farmer.farmName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {product.farmLocation}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{product.farmer.bio}"
                  </p>
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Farm Information
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Farm Size:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.farmer.farmSize?.value}{" "}
                      {product.farmer.farmSize?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Specialization:
                    </span>
                    <span className="capitalize font-medium text-gray-900 dark:text-white bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm">
                      {product.farmer.specialization}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Location:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.farmer.address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Member Since:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(product.farmer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Quality Assurance
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        ✓
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Verified Farmer
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Identity confirmed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        🌱
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Sustainable Practices
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Eco-friendly farming
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        🏆
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        High Quality
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Premium products
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
