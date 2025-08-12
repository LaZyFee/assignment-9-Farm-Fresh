"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Phone, Star, CheckCircle } from "lucide-react";
import Loading from "./Loading";
import Image from "next/image";
import Link from "next/link";

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetch("/api/farmers")
      .then((res) => res.json())
      .then((data) => {
        setFarmers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }
  // Farmers to display based on count
  const visibleFarmers = farmers.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Meet Our Farmers</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Discover the passionate farmers who grow fresh, organic produce
              with care and dedication
            </p>
          </div>
        </div>
        {/* <!-- Stats --> */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 my-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {farmers.length}+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Active Farmers
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              50+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Districts Covered
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              2000+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Products Available
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              95%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Organic Certified
            </div>
          </div>
        </div>

        {/* Farmers Display */}
        {farmers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                No farmers found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8">
            {visibleFarmers.map((farmer) => {
              const imageSrc = farmer.profilePicture?.startsWith("http")
                ? farmer.profilePicture
                : `${process.env.NEXT_PUBLIC_API_URL || ""}${
                    farmer.profilePicture
                  }`;

              return (
                <div
                  key={farmer._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Image + Certified Badge */}
                  <div className="relative">
                    <Image
                      src={imageSrc || "https://via.placeholder.com/400x300"}
                      alt={`${farmer.firstName} ${farmer.lastName}`}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Certified
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name + Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {farmer.firstName} {farmer.lastName}
                      </h3>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {farmer.rating || "4.8"}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {farmer.address}
                    </p>

                    {/* Bio / Description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {farmer.bio ||
                        "Specializes in organic vegetables and has been farming for over 15 years."}
                    </p>

                    {/* Farm Size & Products */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Farm Size:</span>{" "}
                        {farmer.farmSize?.value} {farmer.farmSize?.unit}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Products:</span>{" "}
                        {farmer.products.length || 0}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex space-x-2 mb-4">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                        {farmer.specialization}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        href={`/farmers/${farmer._id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        View Products
                      </Link>

                      <a
                        href={`tel:${farmer.phone}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* SHOW MORE BUTTON */}
        {visibleCount < farmers.length && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Show More Farmers
            </button>
          </div>
        )}
      </div>
      {/* <!-- Join as Farmer CTA --> */}
      <div className="bg-primary-600 text-white py-16 mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Join Our Farmer Community?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Share your fresh produce with thousands of customers and grow your
            business
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Join as Farmer
          </Link>
        </div>
      </div>
    </div>
  );
}
