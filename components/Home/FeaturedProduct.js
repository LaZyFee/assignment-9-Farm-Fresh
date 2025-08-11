import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaArrowRight, FaHeart, FaStar } from 'react-icons/fa'

export const FeaturedProduct = () => {
    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2
                            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            Featured Products
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fresh picks from our local farmers
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                    >
                        View All <FaArrowRight className="ml-1"></FaArrowRight>
                    </Link>
                </div>

                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {/* <!-- Product Card 1 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"
                                alt="Fresh Tomatoes"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                                <span
                                    className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                                >Organic</span
                                >
                            </div>
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <FaHeart
                                        className="text-gray-600 dark:text-gray-400"
                                    ></FaHeart>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Tomatoes
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <FaStar className="text-sm"></FaStar>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.8</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Rahim's Farm • Sylhet
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳45</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 50kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 2 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop"
                                alt="Fresh Carrots"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <FaHeart
                                        className="text-gray-600 dark:text-gray-400"
                                    ></FaHeart>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Carrots
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <FaStar className="fas fa-star text-sm"></FaStar>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.9</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Shumi's Garden • Rangpur
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳35</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 30kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 3 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop"
                                alt="Fresh Spinach"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                                <span
                                    className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                                >Organic</span
                                >
                            </div>
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <FaHeart className="fas fa-heart text-red-500"></FaHeart>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Spinach
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.7</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Sakib's Organics • Dhaka
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳25</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 20kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 4 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop"
                                alt="Fresh Broccoli"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <i
                                        className="far fa-heart text-gray-600 dark:text-gray-400"
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Broccoli
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.6</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Anika's Garden • Chittagong
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳55</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 15kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 5 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop"
                                alt="Fresh Broccoli"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <i
                                        className="far fa-heart text-gray-600 dark:text-gray-400"
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Broccoli
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.6</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Anika's Garden • Chittagong
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳55</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 15kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 6 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop"
                                alt="Fresh Broccoli"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <i
                                        className="far fa-heart text-gray-600 dark:text-gray-400"
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Broccoli
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.6</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Anika's Garden • Chittagong
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳55</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 15kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 7 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop"
                                alt="Fresh Carrots"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <i
                                        className="far fa-heart text-gray-600 dark:text-gray-400"
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Carrots
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.9</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Shumi's Garden • Rangpur
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳35</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 30kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* <!-- Product Card 8 --> */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative">
                            <Image
                                width={400}
                                height={300}
                                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"
                                alt="Fresh Tomatoes"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                                <span
                                    className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                                >Organic</span
                                >
                            </div>
                            <div className="absolute top-3 right-3">
                                <button
                                    className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <i
                                        className="far fa-heart text-gray-600 dark:text-gray-400"
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white"
                                >
                                    Fresh Tomatoes
                                </h3>
                                <div className="flex items-center text-yellow-400">
                                    <i className="fas fa-star text-sm"></i>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-400 ml-1"
                                    >4.8</span
                                    >
                                </div>
                            </div>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                            >
                                By Rahim's Farm • Sylhet
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span
                                        className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                                    >৳45</span
                                    >
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-400"
                                    >/kg</span
                                    >
                                </div>
                                <span
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >Stock: 50kg</span
                                >
                            </div>
                            <button
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>)
}
