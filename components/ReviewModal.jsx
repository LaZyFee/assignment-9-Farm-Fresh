"use client";

import { useState, useEffect } from "react";
import { FaStar, FaTimes } from "react-icons/fa";

export default function ReviewModal({
  productId,
  productName,
  rating: initialRating = 0,
  comment: initialComment = "",
  onClose,
  onSubmit,
  hasReviewed = false,
  isEditing = false,
  reviewId = null,
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState(initialComment);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  const handleRatingChange = (newRating) => {
    if (hasReviewed && !isEditing) return;
    setRating(newRating);
    // Clear rating error when user selects a rating
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: null }));
    }
  };

  const handleCommentChange = (e) => {
    if (hasReviewed && !isEditing) return;
    const newComment = e.target.value;
    setComment(newComment);
    // Clear comment error when user types
    if (errors.comment) {
      setErrors((prev) => ({ ...prev, comment: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating.";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please enter your review comment.";
    } else if (comment.trim().length < 10) {
      newErrors.comment = "Review must be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasReviewed && !isEditing) {
      setErrors({ submit: "You have already reviewed this product." });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload = {
      rating,
      comment: comment.trim(),
      productId,
      reviewId,
    };
    console.log("Submitting review payload:", payload);

    try {
      await onSubmit(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "submitting"} review:`,
        error
      );
      setErrors({
        submit:
          error.message ||
          `Failed to ${
            isEditing ? "update" : "submit"
          } review. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return texts[rating] || "";
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (success) {
    return (
      <div className="relative max-w-lg mx-auto">
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Review {isEditing ? "Updated" : "Submitted"}!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your feedback. Your review will help other customers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditing
            ? "Edit Your Review"
            : hasReviewed
            ? "Your Review"
            : "Write a Review"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Product:{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {productName}
          </span>
        </p>
        {hasReviewed && !isEditing && (
          <div className="mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md inline-block">
            You have already reviewed this product
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300">
            Rate this product *
          </label>
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => handleRatingChange(starValue)}
                  onMouseEnter={() =>
                    hasReviewed && !isEditing ? null : setHover(starValue)
                  }
                  onMouseLeave={() =>
                    hasReviewed && !isEditing ? null : setHover(null)
                  }
                  className={`transition-all duration-200 ${
                    !(hasReviewed && !isEditing)
                      ? "hover:scale-110 cursor-pointer"
                      : "cursor-default"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
                  disabled={hasReviewed && !isEditing}
                  aria-label={`Rate ${starValue} star${
                    starValue > 1 ? "s" : ""
                  }`}
                >
                  <FaStar
                    className={`text-3xl ${
                      starValue <= (hover || rating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rating > 0
                ? `${rating} star${rating > 1 ? "s" : ""} - ${getRatingText(
                    rating
                  )}`
                : "Click to rate this product"}
            </p>
            {rating > 0 && (
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {rating}/5
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Your Review *
          </label>
          <textarea
            rows="5"
            value={comment}
            onChange={handleCommentChange}
            className={`w-full px-4 py-3 border ${
              errors.comment ? "border-red-300" : "border-gray-300"
            } rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              hasReviewed && !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            placeholder="Share your experience with this product... (minimum 10 characters)"
            disabled={isSubmitting || (hasReviewed && !isEditing)}
            maxLength={1000}
            aria-describedby={errors.comment ? "comment-error" : "comment-help"}
          />
          <div className="flex justify-between items-center mt-2">
            <p id="comment-help" className="text-sm text-gray-500">
              {comment.length}/1000 characters{" "}
              {comment.length < 10 && `(${10 - comment.length} more required)`}
            </p>
          </div>
          {errors.comment && (
            <p
              id="comment-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.comment}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {(!hasReviewed || isEditing) && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : isEditing ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition duration-200 disabled:opacity-50"
          >
            {hasReviewed && !isEditing ? "Close" : "Cancel"}
          </button>
        </div>
      </form>

      {/* Close Button */}
      <button
        aria-label="Close modal"
        onClick={handleClose}
        disabled={isSubmitting}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl disabled:opacity-50 transition duration-200"
      >
        <FaTimes />
      </button>
    </div>
  );
}
