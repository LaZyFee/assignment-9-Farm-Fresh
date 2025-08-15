"use client";

import { useSession, signOut } from "next-auth/react";
import useTheme from "@/hooks/useTheme";
import Image from "next/image";
import Link from "next/link";
import { FaSun, FaMoon, FaBars, FaSearch, FaSeedling } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/stores/cartStore";

const Navbar = ({ sideMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { data: session, status, update } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cart, setCart } = useCartStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchCart() {
      try {
        const cartRes = await fetch("/api/cart");
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCart(cartData);
        } else {
          console.error("Failed to fetch cart");
        }
      } catch (err) {
        console.error("Fetch cart error:", err);
      }
    }

    // Only fetch cart if user is authenticated
    if (status === "authenticated") {
      fetchCart();
    }
  }, [setCart, status]);

  if (status === "loading") {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <FaSeedling className="text-white text-xl"></FaSeedling>
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
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const userMenu = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Farmers", href: "/farmers" },
    { name: "My Orders", href: "/bookings" },
    { name: "About", href: "/about" },
  ];

  const farmerMenu = [
    { name: "Home", href: "/" },
    { name: "Farmers", href: "/farmers" },
    { name: "Add Product", href: "/add-product" },
    { name: "Manage Products", href: "/manage-products" },
    { name: "About", href: "/about" },
  ];

  const routesToRender =
    session?.user?.userType === "farmer" ? farmerMenu : userMenu;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <FaSeedling className="text-white text-xl"></FaSeedling>
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

          {sideMenu && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                {routesToRender.map((item, index) => (
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
                <div className="hidden sm:block relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-52 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400"></FaSearch>
                </div>

                {/* Only show cart for authenticated users */}
                {session?.user && (
                  <Link
                    href="/cart"
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                  >
                    <FaCartShopping />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  {session?.user ? (
                    <>
                      <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 focus:outline-none"
                      >
                        {session.user.image || session.user.profilePicture ? (
                          <Image
                            src={
                              session.user.image || session.user.profilePicture
                            }
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover"
                            width={32}
                            height={32}
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            session.user.image || session.user.profilePicture
                              ? "hidden"
                              : "flex"
                          }`}
                        >
                          {session.user.name?.charAt(0) ||
                            session.user.email?.charAt(0)}
                        </div>
                      </button>

                      {open && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {session.user.email}
                            </p>
                            {session.user.userType && (
                              <p className="text-xs text-green-600 dark:text-green-400 capitalize">
                                {session.user.userType}
                              </p>
                            )}
                          </div>
                          <ul className="py-1 text-sm text-gray-700 dark:text-gray-300">
                            <li>
                              <Link
                                href="/profile"
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setOpen(false)}
                              >
                                Profile
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/favourites"
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setOpen(false)}
                              >
                                Favourites
                              </Link>
                            </li>
                          </ul>
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={async () => {
                                setOpen(false);
                                await signOut({ redirect: false });
                                window.location.href = "/"; // Force page reload after logout
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition font-medium"
                    >
                      Login
                    </Link>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                >
                  {theme === "dark" ? <FaSun /> : <FaMoon />}
                </button>

                <button className="md:hidden p-2 text-gray-700 dark:text-gray-300">
                  <FaBars />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
