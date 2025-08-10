import Image from "next/image";

export default async function ProductDetailsPage({ params }) {
    // Use relative URL instead of environment variable
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/products/${params.id}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return (
                <main className="max-w-4xl mx-auto py-8 px-4">
                    <p className="text-red-500">Failed to load product details.</p>
                </main>
            );
        }

        const product = await res.json();

        return (
            <main className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {product.productName}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {product.images?.length > 0 ? (
                            product.images.map((img, i) => (
                                <div key={i} className="relative w-full h-96">
                                    <Image
                                        src={img} // img already contains '/uploads/filename'
                                        alt={product.productName}
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No images available</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                            {product.description}
                        </p>

                        <div className="space-y-2">
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Category:</strong> {product.category}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Price:</strong> ৳{product.price} / {product.unit}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Stock:</strong> {product.stock}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Farm Location:</strong> {product.farmLocation}
                            </p>
                            {product.harvestDate && (
                                <p className="text-gray-900 dark:text-gray-100">
                                    <strong>Harvest Date:</strong>{' '}
                                    {new Date(product.harvestDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        {product.features?.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Features:
                                </h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {product.features.map((feature, i) => (
                                        <li key={i} className="text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Add to cart or contact button */}
                        <div className="mt-6">
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                                Contact Farmer
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    } catch (error) {
        console.error('Error fetching product:', error);
        return (
            <main className="max-w-4xl mx-auto py-8 px-4">
                <p className="text-red-500">Error loading product details. Please try again later.</p>
            </main>
        );
    }
}