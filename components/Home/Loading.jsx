import React from "react";

function Loading() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-96 mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center h-40 shadow-sm bg-gray-100 dark:bg-gray-700"
            >
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-3"></div>
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-500 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Loading;
