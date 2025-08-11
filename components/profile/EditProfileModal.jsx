"use client";

import { useState } from "react";
import { X, Upload, User } from "lucide-react";
import Image from "next/image";
import { updateProfile } from "@/app/actions/profile";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RoleSwitchConfirmation from "@/components/profile/RoleSwitchConfirmation";

export default function EditProfileModal({ user, onClose }) {
  const { update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(user.image);
  const [bioLength, setBioLength] = useState(user.bio?.length || 0);
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    address: user.address || "",
    bio: user.bio || "",
    userType: user.userType || "customer",
    farmName: user.farmName || "",
    specialization: user.specialization || "",
    farmSize: user.farmSize?.value || "",
    farmSizeUnit: user.farmSize?.unit || "acres",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "bio") {
      setBioLength(value.length);
    }

    // Clear farmer-specific fields when switching to customer
    if (name === "userType" && value === "customer") {
      setFormData((prev) => ({
        ...prev,
        farmName: "",
        specialization: "",
        farmSize: "",
        farmSizeUnit: "acres",
      }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Create FormData manually to have better control
    const form = new FormData();

    // Add common fields
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("phone", formData.phone);
    form.append("address", formData.address);
    form.append("bio", formData.bio);
    form.append("userType", formData.userType);

    // Add profile picture if selected
    const profilePictureInput = e.target.querySelector(
      'input[name="profilePicture"]'
    );
    if (profilePictureInput.files[0]) {
      form.append("profilePicture", profilePictureInput.files[0]);
    }

    // Only add farmer fields if userType is farmer and fields have values
    if (formData.userType === "farmer") {
      if (formData.farmName) {
        form.append("farmName", formData.farmName);
      }
      if (formData.specialization) {
        form.append("specialization", formData.specialization);
      }
      if (formData.farmSize) {
        form.append("farmSize", formData.farmSize);
      }
      if (formData.farmSizeUnit) {
        form.append("farmSizeUnit", formData.farmSizeUnit);
      }
    }

    const newUserType = form.get("userType");

    // Check if role is changing
    if (newUserType !== user.userType) {
      // Show confirmation dialog
      setPendingFormData(form);
      setShowRoleConfirmation(true);
      return;
    }

    // If no role change, proceed directly
    await submitForm(form);
  };

  const submitForm = async (form) => {
    setIsLoading(true);

    try {
      const result = await updateProfile(form);

      if (result.success) {
        // Update the session with new user data
        await update();
        router.refresh();

        // Show success message if role changed
        if (result.roleChanged) {
          // You can show a toast notification here
          console.log(result.message);
        }

        onClose();
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    setShowRoleConfirmation(false);
    if (pendingFormData) {
      await submitForm(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleRoleChangeCancel = () => {
    setShowRoleConfirmation(false);
    setPendingFormData(null);
    // Reset the radio button to original value
    setFormData((prev) => ({
      ...prev,
      userType: user.userType,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="p-6"
        >
          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative group">
                <input
                  type="radio"
                  name="userType"
                  value="customer"
                  className="sr-only peer"
                  checked={formData.userType === "customer"}
                  onChange={handleInputChange}
                />
                <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                  <div className="text-center">
                    <User className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors" />
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
                  checked={formData.userType === "farmer"}
                  onChange={handleInputChange}
                />
                <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                  <div className="text-center">
                    <svg
                      className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 6v12h18V6H3zm16 10H5V8h14v8z" />
                      <path d="M7 10h2v4H7zm4-2h2v6h-2zm4 1h2v5h-2z" />
                    </svg>
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

          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {profilePreview ? (
                  <Image
                    src={profilePreview}
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Change photo</span>
                  <input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    className="sr-only"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleProfilePictureChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
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
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
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
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bio{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  maxLength="250"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Brief description
                  </p>
                  <span className="text-xs text-gray-400">{bioLength}/250</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer-specific fields */}
          {formData.userType === "farmer" && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Farm Information
              </h3>
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
                    value={formData.farmName}
                    onChange={handleInputChange}
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
                    value={formData.specialization}
                    onChange={handleInputChange}
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
              <div className="mt-4">
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
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="5.5"
                  />
                  <select
                    name="farmSizeUnit"
                    value={formData.farmSizeUnit}
                    onChange={handleInputChange}
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
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Role Switch Confirmation Modal */}
      <RoleSwitchConfirmation
        isOpen={showRoleConfirmation}
        onConfirm={handleRoleChangeConfirm}
        onCancel={handleRoleChangeCancel}
        currentRole={user.userType}
        newRole={formData.userType}
      />
    </div>
  );
}
