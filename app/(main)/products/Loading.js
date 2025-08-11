import React from 'react'

function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Loading