"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doSocialLogin, registerUser } from "@/app/actions";
import { FaCamera, FaGoogle, FaSeedling, FaUser } from "react-icons/fa";
import { FaEye, FaTractor } from "react-icons/fa6";

export default function RegisterForm({ isModal = false }) {
  const [userType, setUserType] = useState("customer");
  const [profilePreview, setProfilePreview] = useState();
  const [bioLength, setBioLength] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Toggle farmer fields based on userType
  useEffect(() => {
    const farmerFields = document.getElementById("farmerFields");
    if (farmerFields) {
      farmerFields.classList.toggle("hidden", userType !== "farmer");
    }
  }, [userType]);

  // Handle profile picture preview
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side file validation
      if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
        setError("Only PNG, JPG, and GIF files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Profile picture must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Update bio character counter
  const handleBioChange = (e) => {
    setBioLength(e.target.value.length);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const result = await registerUser(formData);
      if (result.success) {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const formData = new FormData();
    formData.append("action", "google");
    await doSocialLogin(formData);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-3 rounded-full">
              <FaSeedling className="text-white text-2xl"></FaSeedling>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join FarmFresh community today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 py-8 px-8 shadow-xl rounded-2xl">
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative group">
                    <input
                      type="radio"
                      name="userType"
                      value="customer"
                      className="sr-only peer"
                      defaultChecked
                      onChange={() => setUserType("customer")}
                    />
                    <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                      <div className="text-center">
                        <FaUser className="fas fa-user text-2xl mb-3 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors"></FaUser>
                        <div className="font-semibold text-gray-900 dark:text-white peer-checked:text-primary-700 dark:peer-checked:text-primary-300">
                          Customer
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Buy fresh produce
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className="relative group">
                    <input
                      type="radio"
                      name="userType"
                      value="farmer"
                      className="sr-only peer"
                      onChange={() => setUserType("farmer")}
                    />
                    <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                      <div className="text-center">
                        <FaTractor className="fas fa-tractor text-2xl mb-3 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors"></FaTractor>
                        <div className="font-semibold text-gray-900 dark:text-white peer-checked:text-primary-700 dark:peer-checked:text-primary-300">
                          Farmer
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sell your produce
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center justify-center space-x-6">
                  <div className="shrink-0">
                    <Image
                      id="profilePreview"
                      className="h-20 w-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                      src={profilePreview}
                      alt="Profile preview"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="flex-1 max-w-xs">
                    <label
                      htmlFor="profilePicture"
                      className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition block text-center"
                    >
                      <span className="flex items-center justify-center">
                        <FaCamera className="mr-2"></FaCamera>
                        Choose photo
                      </span>
                      <input
                        id="profilePicture"
                        name="profilePicture"
                        type="file"
                        className="sr-only"
                        accept="image/png,image/jpeg,image/gif"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Enter your full address"
                    ></textarea>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          input.type =
                            input.type === "password" ? "text" : "password";
                        }}
                      >
                        <FaEye className="text-gray-400 hover:text-gray-600"></FaEye>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Bio
                      <span className="text-gray-400 text-xs font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      maxLength="250"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Tell us about yourself..."
                      onChange={handleBioChange}
                    ></textarea>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Brief description
                      </p>
                      <span id="bioCounter" className="text-xs text-gray-400">
                        {bioLength}/250
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          input.type =
                            input.type === "password" ? "text" : "password";
                        }}
                      >
                        <FaEye className="fas fa-eye text-gray-400 hover:text-gray-600"></FaEye>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer-specific fields */}
              <div id="farmerFields" className="hidden space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="farmName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Farm Name
                    </label>
                    <input
                      id="farmName"
                      name="farmName"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Green Valley Farm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Specialization
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select specialization</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="grains">Grains</option>
                      <option value="dairy">Dairy</option>
                      <option value="mixed">Mixed Farming</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="farmSize"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Farm Size
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="farmSize"
                      name="farmSize"
                      type="number"
                      min="0"
                      step="0.1"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="5.5"
                    />
                    <select
                      id="farmSizeUnit"
                      name="farmSizeUnit"
                      className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                      <option value="sq_ft">Sq Ft</option>
                      <option value="sq_m">Sq M</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter the total area of your farm
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  I agree to the
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms and Conditions
                  </a>
                  and
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200 flex items-center justify-center space-x-2 mt-4"
            >
              <FaGoogle className="text-red-500"></FaGoogle>
              <span>Continue with Google</span>
            </button>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
