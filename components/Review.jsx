"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function Reviews({ product }) {
  const { data: session } = useSession();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, text: "" });

  // Determine if the user can review
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (!session) return;

    const checkCanReview = async () => {
      try {
        const res = await fetch(`/api/products/${product._id}/can-review`);
        const data = await res.json();
        if (res.ok) setCanReview(data.canReview);
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    };

    checkCanReview();
  }, [session, product._id]);

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
        Swal.fire({
          icon: "success",
          title: "Review submitted!",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 2000,
        });
        setShowReviewForm(false);
        setFormData({ rating: 5, text: "" });
        window.location.reload(); // Refresh product to update reviews
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          text: data.error || "Failed to submit review",
        });
      }
    } catch (error) {
      Swal.fire({ icon: "error", text: "Error submitting review" });
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl mt-16">
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
          <form onSubmit={handleSubmitReview}>
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
                Submit Review
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

      {/* Individual Reviews */}
      <div className="space-y-6">
        {product.reviews?.length > 0 ? (
          product.reviews.map((review) => (
            <div
              key={review._id}
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
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}

export default Reviews;
