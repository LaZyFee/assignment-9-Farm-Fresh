'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductDetailsSkeleton } from '@/components/ProductDetailsSkeleton';
import NotFound from './not-found';
import ErrorComponent from './error';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!params.id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/products/${params.id}`);

                if (res.status === 404) {
                    router.push('/404');
                    return;
                }

                if (!res.ok) {
                    throw new Error('Failed to fetch product');
                }

                const productData = await res.json();
                setProduct(productData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id, router]);

    if (loading) return <ProductDetailsSkeleton />;
    if (error) return <ErrorComponent error={error} />;
    if (!product) return <NotFound />;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li className="text-gray-400 dark:text-gray-600">/</li>
                        <li>
                            <Link href="/products" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                Products
                            </Link>
                        </li>
                        <li className="text-gray-400 dark:text-gray-600">/</li>
                        <li className="text-gray-600 dark:text-gray-400 truncate">
                            {product.productName}
                        </li>
                    </ol>
                </nav>

                {/* Main Content */}
                <div className="rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Product Images */}
                        <div className=" p-6 lg:p-8 h-fit">
                            {product.images?.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Main Image */}
                                    <div className="relative w-full h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.productName}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>

                                    {/* Additional Images */}
                                    {product.images.length > 1 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {product.images.slice(1, 4).map((img, i) => (
                                                <div key={i} className="relative h-24 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md">
                                                    <Image
                                                        src={img}
                                                        alt={`${product.productName} ${i + 2}`}
                                                        fill
                                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                                        sizes="150px"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-80 lg:h-96 bg-gray-100 dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center shadow-inner">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">No images available</span>
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="p-6 lg:p-8">
                            {/* Product Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                                {product.productName}
                            </h1>

                            {/* Description */}
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Price Section */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Price</p>
                                        <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                                            ৳{product.price}
                                            <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                                                / {product.unit}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Stock</p>
                                        <p className={`text-xl font-semibold ${product.stock > 10
                                            ? 'text-green-600 dark:text-green-400'
                                            : product.stock > 0
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {product.stock} units
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{product.category}</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Farm Location</span>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{product.farmLocation}</p>
                                </div>

                                {product.harvestDate && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:col-span-2">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Harvest Date</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {new Date(product.harvestDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            {product.features?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Key Features
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {product.features.map((feature, i) => (
                                            <div key={i} className="flex items-start">
                                                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="space-y-3">
                                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                                    Contact Farmer
                                </button>
                                <button className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-6 rounded-xl font-medium transition-colors">
                                    Add to Favourite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
