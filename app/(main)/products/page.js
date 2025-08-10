"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
                Loading products...
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
                Our Products
            </h1>

            {products.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                        >
                            {/* Image */}
                            {product.images?.[0] && (
                                <div className="relative w-full h-48">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.productName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {product.productName}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    {product.description.length > 80
                                        ? product.description.slice(0, 80) + "..."
                                        : product.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                                        ৳{product.price} / {product.unit}
                                    </span>
                                    <Link
                                        href={`/products/${product._id}`}
                                        className="text-sm bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 transition"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
