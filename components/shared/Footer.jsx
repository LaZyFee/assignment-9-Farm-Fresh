import Link from "next/link";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaSeedling,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <FaSeedling className="fas fa-seedling text-white text-xl"></FaSeedling>
              </div>
              <div>
                <h3 className="text-xl font-bold">FarmFresh</h3>
                <p className="text-sm text-gray-400">Local Farmer Booking</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting communities with fresh, local produce directly from
              farmers.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <FaFacebookF />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <FaTwitter />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <FaInstagram />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="products.html" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="farmers.html" className="hover:text-white">
                  Farmers
                </Link>
              </li>
              <li>
                <Link href="about.html" className="hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Farmers</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="register.html" className="hover:text-white">
                  Join as Farmer
                </Link>
              </li>
              <li>
                <Link href="create.html" className="hover:text-white">
                  Add Products
                </Link>
              </li>
              <li>
                <Link href="manageList.html" className="hover:text-white">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Farmer Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 FarmFresh - Local Farmer Booking. All rights reserved by
            LWS.
          </p>
        </div>
      </div>
    </div>
  );
}
