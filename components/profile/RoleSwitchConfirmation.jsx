"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function RoleSwitchConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  currentRole,
  newRole,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const isDowngrading = currentRole === "farmer" && newRole === "customer";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                isDowngrading
                  ? "bg-amber-100 dark:bg-amber-900/20"
                  : "bg-blue-100 dark:bg-blue-900/20"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  isDowngrading
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Role Change
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You are about to change your account type from{" "}
            <span className="font-semibold capitalize text-gray-900 dark:text-white">
              {currentRole}
            </span>{" "}
            to{" "}
            <span className="font-semibold capitalize text-gray-900 dark:text-white">
              {newRole}
            </span>
            .
          </p>

          {isDowngrading && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Important Notice:
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Your farm information will be removed</li>
                <li>• Any active product listings will be deactivated</li>
                <li>• You will lose access to farmer-specific features</li>
                <li>
                  • This action can be reversed by switching back to Farmer
                </li>
              </ul>
            </div>
          )}

          {newRole === "farmer" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                You'll gain access to:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Product listing and management</li>
                <li>• Farm profile and information</li>
                <li>• Farmer dashboard and analytics</li>
                <li>• Direct customer communication</li>
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to proceed with this change?
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDowngrading
                ? "bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? "Processing..." : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
}
