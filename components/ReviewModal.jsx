"use client";

import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

export default function ReviewModal({
  productId,
  productName,
  rating: initialRating = 0,
  setRating: parentSetRating,
  comment: initialComment = "",
  setComment: parentSetComment,
  onClose,
  onSubmit,
}) {
  const [localRating, setLocalRating] = useState(initialRating);
  const [hover, setHover] = useState(null);
  const [localComment, setLocalComment] = useState(initialComment);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when parent props change
  useEffect(() => {
    setLocalRating(initialRating);
  }, [initialRating]);

  useEffect(() => {
    setLocalComment(initialComment);
  }, [initialComment]);

  const handleRatingChange = (newRating) => {
    setLocalRating(newRating);
    if (parentSetRating) {
      parentSetRating(newRating);
    }
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setLocalComment(newComment);
    if (parentSetComment) {
      parentSetComment(newComment);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (localRating === 0) newErrors.rating = "Please select a rating.";
    if (!localComment.trim()) newErrors.comment = "Please enter your comment.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit();
        } else {
          // Default submission logic if onSubmit is not provided
          const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              rating: localRating,
              comment: localComment.trim(),
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to submit review");
          }
        }

        onClose();
      } catch (error) {
        console.error("Error submitting review:", error);
        setErrors({ submit: "Failed to submit review. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Write a Review
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Reviewing: <span className="font-medium">{productName}</span>
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Rating */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Rate this product
          </label>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => handleRatingChange(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(null)}
                  className="transition-all duration-200 hover:scale-110 focus:outline-none"
                >
                  <FaStar
                    className={`text-3xl ${
                      starValue <= (hover || localRating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {localRating > 0
              ? `You rated this ${localRating} star${
                  localRating > 1 ? "s" : ""
                }`
              : "Click to rate this product"}
          </p>
          {errors.rating && (
            <p className="text-red-500 text-xs italic">{errors.rating}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Comment
          </label>
          <textarea
            rows="4"
            value={localComment}
            onChange={handleCommentChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Write your review here..."
            disabled={isSubmitting}
          />
          {errors.comment && (
            <p className="text-red-500 text-xs italic">{errors.comment}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <p className="text-red-500 text-sm">{errors.submit}</p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-900 text-white py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Close Button */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}
