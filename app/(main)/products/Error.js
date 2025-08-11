import React from 'react'

function Error({ error }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-200 dark:border-red-800">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-red-500 dark:text-red-400">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading Products
                </h3>
                <p className="text-red-500 dark:text-red-300">{error}</p>
            </div>
        </div>
    )
}

export default Error