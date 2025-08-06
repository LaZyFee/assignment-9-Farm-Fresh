"use client";

import { useSession, signOut } from "next-auth/react";
import useTheme from "@/hooks/useTheme";
import Image from "next/image";
import Link from "next/link";
import { FaSun, FaMoon, FaBars, FaChevronDown } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";

const Navbar = ({ sideMenu }) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const { data: session, status } = useSession();

  if (!mounted) return null;

  const userMenu = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Farmers", href: "/farmers" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <i className="fas fa-seedling text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FarmFresh
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Local Farmer Booking
              </p>
            </div>
          </Link>

          {/* Navigation */}
          {sideMenu && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                {userMenu.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden sm:block relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>

                {/* Cart */}
                <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                  <FaCartShopping />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                {/* User menu */}
                <div className="relative">
                  {status === "loading" ? (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  ) : session?.user ? (
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {session.user.name?.charAt(0) ||
                              session.user.email?.charAt(0)}
                          </div>
                        )}
                        <span className="hidden sm:block">
                          {session.user.name || session.user.email}
                        </span>
                        <FaChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-1 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition font-medium"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-700 dark:text-gray-300">
              <FaBars />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
