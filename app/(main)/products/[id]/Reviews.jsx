/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
function Reviews({ product }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, text: "" });

  // Fetch reviews
  const fetchReviews = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/${product._id}/reviews?page=${pageNum}&limit=5`
      );
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) =>
          pageNum === 1 ? data.reviews : [...prev, ...data.reviews]
        );

        setHasMore(data.reviews.length > 5);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
          text: data.error || "Failed to load reviews",
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  //  if user can review
  const checkCanReview = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/products/${product._id}/can-review`);
      const data = await res.json();
      if (res.ok) {
        setCanReview(data.canReview);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    checkCanReview();
  }, [product._id, session]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: formData.rating,
          text: formData.text,
        }),
      });
      if (res.ok) {
        toast.success("Review submitted!");
        setShowReviewForm(false);
        setFormData({ rating: 5, text: "" });
        fetchReviews(1); // Refresh reviews
        checkCanReview(); // Recheck eligibility
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Error submitting review");
    }
  };

  // Handle edit review
  const handleEditReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/reviews/${editReview._id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Review updated!");
        setShowReviewForm(false);
        setEditReview(null);
        setFormData({ rating: 5, text: "" });
        fetchReviews(1); // Refresh reviews
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update review");
      }
    } catch (error) {
      toast.error("Error updating review");
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted!");
        fetchReviews(1); // Refresh reviews
        checkCanReview(); // Recheck eligibility
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error("Error deleting review");
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    setPage((prev) => prev + 1);
    fetchReviews(page + 1);
  };
  const ratingSummary = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const total = reviews.length || 1;
    const percentage = Math.round((count / total) * 100);
    return { stars: star, count, percentage };
  });

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h2>
          {session && canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {editReview ? "Edit Your Review" : "Write Your Review"}
            </h3>
            <form onSubmit={editReview ? handleEditReview : handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} Star{star > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {editReview ? "Update Review" : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditReview(null);
                    setFormData({ rating: 5, text: "" });
                  }}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rating Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {product.rating || 0}
                </span>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on {product.reviewsCount || 0} reviews
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {ratingSummary.map((rating) => (
                <div key={rating.stars} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating.stars}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                    {rating.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start space-x-4">
                <Image
                  src={review.user.image || "/default-user.jpg"}
                  alt={review.user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(review.rating)].map((_, i) => (
                            <i key={i} className="fas fa-star"></i>
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <i key={i} className="far fa-star"></i>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {session && review.user._id === session.user.id && (
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg hidden group-hover:block">
                          <button
                            onClick={() => {
                              setEditReview(review);
                              setFormData({
                                rating: review.rating,
                                text: review.text,
                              });
                              setShowReviewForm(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {review.text}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <button className="hover:text-primary-600 dark:hover:text-primary-400">
                      <i className="far fa-thumbs-up mr-1"></i>Helpful (
                      {review.helpful})
                    </button>
                    <button className="hover:text-primary-600 dark:hover:text-primary-400">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreReviews}
              disabled={loading}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Reviews"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
