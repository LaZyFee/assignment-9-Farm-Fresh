"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Phone, MapPin, Leaf } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("contact");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-4 py-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center max-w-sm w-full">
          <div className="mx-auto mb-5 w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You must be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  const { user } = session;

  // badge colors by userType
  const userTypeColors = {
    farmer:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    customer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  const badgeColor =
    userTypeColors[user.userType?.toLowerCase()] || userTypeColors.default;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left sidebar */}
        <aside className="md:w-1/3 bg-gradient-to-b from-green-400 to-blue-500 p-8 flex flex-col items-center text-center text-white relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Profile Picture"}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white bg-opacity-30 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="w-12 h-12" />
            </div>
          )}

          <h1 className="mt-6 text-2xl font-semibold">
            {user.name || "Anonymous User"}
          </h1>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${badgeColor}`}
          >
            <Leaf className="inline-block mr-1 h-4 w-4" />
            {user.userType
              ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
              : "User"}
          </span>

          <p className="mt-4 text-sm max-w-xs opacity-90">
            {user.bio ||
              "No bio added yet. Add a short bio to introduce yourself."}
          </p>
        </aside>

        {/* Right content area */}
        <section className="md:w-2/3 p-8 text-gray-900 dark:text-gray-100">
          {/* Tabs */}
          <nav className="flex space-x-6 border-b border-gray-300 dark:border-gray-700 mb-8">
            <button
              className={`pb-2 font-semibold text-lg ${
                tab === "contact"
                  ? "border-b-4 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
              onClick={() => setTab("contact")}
            >
              Contact Info
            </button>
          </nav>

          {tab === "contact" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 shadow-sm">
                <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-900/30">
                  <Mail className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-lg">{user.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 shadow-sm">
                <div className="p-2 rounded-lg bg-green-200 dark:bg-green-900/30">
                  <Phone className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-lg">{user.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 shadow-sm">
                <div className="p-2 rounded-lg bg-red-200 dark:bg-red-900/30">
                  <MapPin className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Address
                  </p>
                  <p className="text-lg">{user.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
