export function ProductDetailsSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Skeleton */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 lg:p-8">
                            <div className="w-full h-80 lg:h-96 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="p-6 lg:p-8">
                            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-4"></div>
                            <div className="space-y-2 mb-6">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                            </div>
                            <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse mb-6"></div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                                <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}