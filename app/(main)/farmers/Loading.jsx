import React from "react";

function Loading() {
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

export default Loading;
