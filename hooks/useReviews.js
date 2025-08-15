"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useReviews() {
    const { data: session } = useSession();
    const [reviewedProducts, setReviewedProducts] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch user's reviewed products
    const fetchReviewedProducts = async () => {
        if (!session?.user?.id) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?userId=${session.user.id}`);
            const data = await res.json();

            if (data.reviews) {
                const reviewedProductIds = data.reviews.map(review => review.product);
                setReviewedProducts(new Set(reviewedProductIds));
            }
        } catch (error) {
            console.error("Error fetching reviewed products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Check if a specific product has been reviewed by the user
    const hasReviewedProduct = (productId) => {
        return reviewedProducts.has(productId);
    };

    // Check if user can review a product (must have purchased and received it)
    const canReviewProduct = async (productId) => {
        if (!session?.user?.id) return false;

        try {
            const res = await fetch(`/api/orders/can-review?productId=${productId}`);
            const data = await res.json();
            return data.canReview && !hasReviewedProduct(productId);
        } catch (error) {
            console.error("Error checking review eligibility:", error);
            return false;
        }
    };

    // Submit a review
    const submitReview = async (productId, rating, comment) => {
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            // Add to reviewed products
            setReviewedProducts(prev => new Set([...prev, productId]));
            return data;
        } catch (error) {
            console.error("Error submitting review:", error);
            throw error;
        }
    };

    // Get reviews for a product
    const getProductReviews = async (productId) => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            return data.reviews || [];
        } catch (error) {
            console.error("Error fetching product reviews:", error);
            return [];
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchReviewedProducts();
        }
    }, [session?.user?.id]);

    return {
        reviewedProducts,
        loading,
        hasReviewedProduct,
        canReviewProduct,
        submitReview,
        getProductReviews,
        fetchReviewedProducts,
    };
}