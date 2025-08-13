'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductDetailsSkeleton } from '@/components/ProductDetailsSkeleton';
import NotFound from './not-found';
import ErrorComponent from './error';
import Image from 'next/image';
import Link from 'next/link';
import { FaBolt, FaHeart, FaMapMarkerAlt, FaMinus, FaPlus, FaShoppingCart, FaStar } from 'react-icons/fa';
import Reviews from './Reviews';
import RelatedProduct from './RelatedProduct';
import ProductTabs from './ProductTabs';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useCartStore } from '@/stores/cartStore';
import Swal from 'sweetalert2';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState();
    const [quantity, setQuantity] = useState(1);

    const { favorites, toggleFavorite, setFavorites } = useFavoriteStore();
    const { cart, addToCart, setCart } = useCartStore();

    const isInCart = cart.some(
        (item) => item.product._id.toString() === (product?._id?.toString() || '')
    );
    const isFavorite = favorites.includes(product?._id?.toString() || '');

    useEffect(() => {
        if (!params.id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch product
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
                setMainImage(productData.images[0]);

                // Fetch favorites
                const favoritesRes = await fetch("/api/favorites");
                if (!favoritesRes.ok) throw new Error("Failed to fetch favorites");
                const favoritesData = await favoritesRes.json();
                setFavorites(favoritesData.map((id) => id.toString()));

                // Fetch cart
                const cartRes = await fetch("/api/cart");
                if (cartRes.ok) {
                    const cartData = await cartRes.json();
                    setCart(cartData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, router, setFavorites, setCart]);

    const handleImageClick = (image) => {
        setMainImage(image);
    };

    const handleToggleFavorite = async () => {
        if (!product) return;
        try {
            await toggleFavorite(product._id);
        } catch (err) {
            console.error("Failed to update favorite:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                text: "Failed to update favorite. Please try again.",
            });
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        const cartItem = cart.find((item) => item.product._id.toString() === product._id.toString());
        const totalQuantity = (cartItem?.quantity || 0) + quantity - 1;
        if (totalQuantity > product.stock) {
            Swal.fire({
                icon: "error",
                title: "Stock Limit Reached",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                text: `Cannot add ${totalQuantity} ${product.unit}. Only ${product.stock} ${product.unit} available.`,
            });
            return;
        }
        addToCart({ product, quantity });
        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            text: `${quantity} ${product.productName} has been added to your cart.`,
        });
    };
    const handleBuyNow = () => {
        handleAddToCart();
        if (!isInCart) {
            router.push('/cart');
        }
    };


    if (loading) return <ProductDetailsSkeleton />;
    if (error) return <ErrorComponent error={error} />;
    if (!product) return <NotFound />;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
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

                <div className="rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="p-6 lg:p-8 h-fit">
                            {product.images?.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            id="mainImage"
                                            src={mainImage || '/placeholder-image.jpg'}
                                            alt={product.productName}
                                            width={600}
                                            height={600}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {product.images.map((img, index) => (
                                            <button
                                                key={index}
                                                className={`aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${mainImage === img ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}`}
                                                onClick={() => handleImageClick(img)}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`${product.productName} ${index + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                />
                                            </button>
                                        ))}
                                    </div>
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

                        <div className="p-6 lg:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                {product.features.map((feature, index) => (
                                    <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                                {product.productName}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Produced by <span className="font-semibold text-primary-600 dark:text-primary-400">{product.farmer.farmName}</span>
                            </p>
                            <div className="flex items-center space-x-4 my-8">
                                <div className="flex items-center space-x-1">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.rating || 0}</span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">({product.reviewsCount || 0} reviews)</span>
                                <button className="text-primary-600 dark:text-primary-400 hover:underline">
                                    Write a review
                                </button>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">৳{product.price}</span>
                                        <span className="text-lg text-gray-500 dark:text-gray-400">/{product.unit}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Stock</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.stock} {product.unit}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                                    <FaMapMarkerAlt className="mr-2"></FaMapMarkerAlt>
                                    <span>{product.farmLocation}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Quantity ({product.unit})
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            disabled={quantity <= 1}
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaMinus className="text-sm" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            min="1"
                                            max={product.stock}
                                            onChange={(e) =>
                                                setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))
                                            }
                                            className="w-20 text-center py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            disabled={quantity >= product.stock}
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaPlus className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 my-5">
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <FaBolt /> Buy Now
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isInCart}
                                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${isInCart
                                        ? "bg-gray-400 dark:bg-gray-600 text-gray-100 cursor-not-allowed"
                                        : "bg-primary-500 hover:bg-emerald-700 text-white"
                                        }`}
                                    aria-label={
                                        isInCart
                                            ? `${product.productName} is already in cart`
                                            : `Add ${product.productName} to cart`
                                    }
                                >
                                    <FaShoppingCart /> {isInCart ? "In Cart" : "Add to Cart"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${isFavorite
                                        ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                                        }`}
                                    aria-label={
                                        isFavorite
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                >
                                    <FaHeart className={isFavorite ? "text-red-500" : ""} />{" "}
                                    {isFavorite ? "Remove from Favorite" : "Add to Favorite"}
                                </button>
                            </div>
                            <div className="bg-primary-50 dark:bg-primary-600 rounded-xl p-4 text-white">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={product.farmer.profilePicture || "https://images.unsplash.com/photo-10007003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"}
                                        alt={product.farmer.firstName + " " + product.farmer.lastName}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{product.farmer.firstName} {product.farmer.lastName}</h4>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            Farmer since {new Date(product.farmer.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ProductTabs product={product} />
            <Reviews product={product} />
            <RelatedProduct product={product} />
        </main>
    );
}