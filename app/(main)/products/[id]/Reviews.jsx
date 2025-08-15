/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ReviewModal from "@/components/ReviewModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

function Reviews({ product }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [reviewReasons, setReviewReasons] = useState([]);
  const [userReview, setUserReview] = useState(null);

  // Fetch reviews
  const fetchReviews = async (pageNum = 1) => {
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
        setHasMore(data.hasMore);

        // Check if user's review is included
        if (session && pageNum === 1) {
          const userReviewInList = data.reviews.find(
            (review) => review.user._id === session.user.id
          );
          setUserReview(userReviewInList);
        }
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
      Swal.fire({
        icon: "error",
        title: "Error",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
        text: "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user can review
  const checkCanReview = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/products/${product._id}/can-review`);
      const data = await res.json();
      if (res.ok) {
        setCanReview(data.canReview);
        setReviewReasons(data.reasons || []);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    if (status === "authenticated") {
      checkCanReview();
    }
  }, [product._id, session, status]);

  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Review submitted!",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 2000,
        });
        setShowReviewModal(false);
        // Refresh reviews and check eligibility
        fetchReviews(1);
        checkCanReview();
        setPage(1);
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error; // Let ReviewModal handle the error
    }
  };

  // Handle edit review
  const handleEditReview = async (reviewData) => {
    try {
      const res = await fetch(`/api/reviews/${editReview._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Review updated!",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 2000,
        });
        setShowReviewModal(false);
        setEditReview(null);
        fetchReviews(1);
        setPage(1);
      } else {
        throw new Error(data.error || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      throw error; // Let ReviewModal handle the error
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Review deleted!",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchReviews(1);
        checkCanReview();
        setPage(1);
        setUserReview(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to delete review",
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error deleting review",
      });
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  // Calculate rating summary
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
          {session && canReview && !userReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <ReviewModal
                  productId={product._id}
                  productName={product.productName}
                  rating={editReview?.rating || 0}
                  comment={editReview?.comment || ""}
                  onClose={() => {
                    setShowReviewModal(false);
                    setEditReview(null);
                  }}
                  onSubmit={editReview ? handleEditReview : handleReviewSubmit}
                  hasReviewed={!!userReview}
                  isEditing={!!editReview}
                  reviewId={editReview?._id}
                />
              </div>
            </div>
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
                      <FaStar
                        key={i}
                        className={
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
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
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start space-x-4">
                <Image
                  src={review.user.profilePicture || "/default-user.jpg"}
                  alt={`${review.user.firstName} ${review.user.lastName}`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
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
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button
                            onClick={() => {
                              setEditReview(review);
                              setShowReviewModal(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Reviews Message */}
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to review this product!
            </p>
          </div>
        )}

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

        {/* Loading State */}
        {loading && reviews.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading reviews...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
