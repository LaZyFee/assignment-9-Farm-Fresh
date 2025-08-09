"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Users,
  MapPin,
  Phone,
  Mail,
  Sprout,
  Maximize,
  Grid,
  List,
} from "lucide-react";

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetch("/api/farmers")
      .then((res) => res.json())
      .then((data) => {
        setFarmers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      `${farmer.firstName} ${farmer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      selectedSpecialization === "all" ||
      farmer.specialization.toLowerCase() ===
        selectedSpecialization.toLowerCase();

    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(farmers.map((f) => f.specialization))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                Loading farmers directory...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sprout className="w-12 h-12 text-green-600 dark:text-green-400 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
              Farmers Directory
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Connect with local agricultural professionals
          </p>
          <div className="flex items-center justify-center text-lg text-green-700 dark:text-green-400 font-semibold">
            <Users className="w-5 h-5 mr-2" />
            {farmers.length} Registered Farmers
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search farmers, farms, or specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
            </div>

            {/* Specialization Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-w-[200px] appearance-none cursor-pointer"
              >
                <option value="all">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-900 shadow-md text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-900 shadow-md text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredFarmers.length === farmers.length
              ? `Showing all ${farmers.length} farmers`
              : `Found ${filteredFarmers.length} of ${farmers.length} farmers`}
          </div>
        </div>

        {/* Farmers Display */}
        {filteredFarmers.length === 0 ? (
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
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 dark:border-gray-700 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Farmer Avatar/Initial */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {farmer.firstName?.[0]}
                      {farmer.lastName?.[0]}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {farmer.firstName} {farmer.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {farmer.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Farm Name */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-1">
                      {farmer.farmName}
                    </h4>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Maximize className="w-4 h-4 mr-1" />
                      {farmer.farmSize?.value} {farmer.farmSize?.unit}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start mb-4 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{farmer.address}</span>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${farmer.email}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </a>
                    <a
                      href={`tel:${farmer.phone}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      Farmer
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Farm Details
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer, index) => (
                    <tr
                      key={farmer._id}
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0
                          ? "bg-white/50 dark:bg-gray-900/50"
                          : "bg-gray-50/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {farmer.firstName?.[0]}
                            {farmer.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-100">
                              {farmer.firstName} {farmer.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-green-700 dark:text-green-400">
                          {farmer.farmName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Maximize className="w-3 h-3 mr-1" />
                          {farmer.farmSize?.value} {farmer.farmSize?.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                          {farmer.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                          {farmer.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <a
                            href={`mailto:${farmer.email}`}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </a>
                          <a
                            href={`tel:${farmer.phone}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
