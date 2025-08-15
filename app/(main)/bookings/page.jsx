"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import Modal from "react-modal";
import Image from "next/image";
import {
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaCircle,
  FaDownload,
  FaStar,
  FaRedo,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import ReviewModal from "@/components/ReviewModal";

export default function BookingsPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [Loading, setLoading] = useState(true);
  const [reviewedProducts, setReviewedProducts] = useState(new Map());
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);

      // After fetching orders, check review status for all products
      if (session?.user?.id && data.length > 0) {
        await checkReviewStatusForAllProducts(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewStatusForAllProducts = async (ordersData) => {
    try {
      const reviewStatusMap = new Map();

      // Collect all unique product IDs from all orders
      const allProductIds = new Set();
      ordersData.forEach((order) => {
        order.items?.forEach((item) => {
          // Handle both populated and non-populated product references
          const productId =
            typeof item.product === "string"
              ? item.product
              : item.product._id || item.product;
          allProductIds.add(productId);
        });
      });

      // Check review status for each product
      const checkPromises = Array.from(allProductIds).map(async (productId) => {
        try {
          const res = await fetch(
            `/api/reviews?productId=${productId}&userId=${session.user.id}`
          );
          const data = await res.json();
          reviewStatusMap.set(productId, data.hasReviewed || false);
          return { productId, hasReviewed: data.hasReviewed || false };
        } catch (error) {
          console.error(
            `Error checking review for product ${productId}:`,
            error
          );
          reviewStatusMap.set(productId, false);
          return { productId, hasReviewed: false };
        }
      });

      const results = await Promise.all(checkPromises);
      console.log("Review check results:", results);

      setReviewedProducts(reviewStatusMap);
    } catch (error) {
      console.error("Error checking review status for products:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancel = (orderId) => handleStatusChange(orderId, "cancelled");

  const handleReorder = (order) => {
    order.items.forEach((item) =>
      addToCart({ product: item.product, quantity: item.quantity })
    );
    useCheckoutStore.setState({
      deliveryAddress: order.deliveryAddress,
      deliveryDate: order.deliveryDate.split("T")[0],
      deliveryTime: order.deliveryTime,
    });
    router.push("/payment");
  };

  const openReviewModal = async (productId, productName) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setComment("");
    setRating(5);
    setReviewModalOpen(true);
  };

  const submitReview = async ({ productId, rating, comment }) => {
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

      if (res.ok) {
        setReviewedProducts((prev) => {
          const newMap = new Map(prev);
          newMap.set(productId, true);
          return newMap;
        });
        setReviewModalOpen(false);
        setComment("");
        setRating(5);
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const canReview = (order, productId) => {
    // Can only review if order is delivered and product hasn't been reviewed
    return order.status === "delivered" && !reviewedProducts.get(productId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-600" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-600" />;
      case "shipped":
        return <FaCheckCircle className="text-purple-600" />;
      case "delivered":
        return <FaCheckCircle className="text-green-600" />;
      case "cancelled":
        return <FaTimes className="text-red-600" />;
      default:
        return <FaCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (Loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a
                href="/"
                className="text-gray-500 hover:text-primary-600 transition"
              >
                Home
              </a>
            </li>
            <li>
              <FaChevronRight className="text-gray-400 text-xs" />
            </li>
            <li className="text-gray-900 dark:text-white font-medium">
              My Orders
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your orders ({orders.length} total)
            </p>
            {/* Debug info - remove in production */}
            <p className="text-sm text-gray-500 mt-1">
              Reviewed products:{" "}
              {
                Array.from(reviewedProducts.entries()).filter(
                  ([_, reviewed]) => reviewed
                ).length
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition">
              <option>All Orders</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ৳{order.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Items ({order.items?.length})
                    </h4>
                    {order.items?.map((item) => {
                      // Handle both populated and non-populated product references
                      const productId =
                        typeof item.product === "string"
                          ? item.product
                          : item.product._id || item.product;
                      const hasReviewed =
                        reviewedProducts.get(productId) === true;

                      // Handle product data - if not populated, show minimal info
                      const productData =
                        typeof item.product === "string"
                          ? { productName: "Product", images: [], unit: "item" }
                          : item.product;

                      return (
                        <div
                          key={productId}
                          className="flex items-center space-x-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <Image
                            src={productData.images?.[0] || "/placeholder.jpg"}
                            alt={productData.productName || "Product"}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {productData.productName || "Product"}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              By{" "}
                              {productData.farmer?.farmName ||
                                productData.farmer?.name ||
                                "Farm"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity}{" "}
                              {productData.unit || "item"} • ৳{item.price}/
                              {productData.unit || "item"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ৳{(item.price * item.quantity)?.toLocaleString()}
                            </p>
                            {hasReviewed && (
                              <span className="inline-flex items-center text-xs text-green-600 mt-1">
                                <FaCheck className="mr-1" />
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Status Progress */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Order Status
                    </h4>
                    <div className="flex items-center space-x-4 text-sm">
                      {["pending", "confirmed", "shipped", "delivered"].map(
                        (step, i) => {
                          const isActive = order.status === step;
                          const isCompleted =
                            ["confirmed", "shipped", "delivered"].includes(
                              order.status
                            ) &&
                            [
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                            ].indexOf(step) <=
                              [
                                "pending",
                                "confirmed",
                                "shipped",
                                "delivered",
                              ].indexOf(order.status);

                          return (
                            <div key={step} className="flex items-center">
                              <div
                                className={`flex items-center ${
                                  isCompleted
                                    ? "text-green-600"
                                    : isActive
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <FaCheckCircle className="mr-2" />
                                ) : isActive ? (
                                  <FaClock className="mr-2" />
                                ) : (
                                  <FaCircle className="mr-2" />
                                )}
                                <span className="capitalize font-medium">
                                  {step}
                                </span>
                              </div>
                              {i < 3 && (
                                <div
                                  className={`w-8 h-0.5 ml-4 ${
                                    isCompleted
                                      ? "bg-green-600"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                ></div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  {order.deliveryAddress && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Delivery Information
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {order.deliveryAddress}
                        </p>
                        {order.deliveryDate && (
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        )}
                        {order.deliveryTime && (
                          <p>
                            <span className="font-medium">Time:</span>{" "}
                            {order.deliveryTime}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6 flex flex-wrap gap-3">
                    <a
                      href={`/api/invoice/${order._id}`}
                      download
                      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition duration-200"
                    >
                      <FaDownload className="mr-2" />
                      Download Receipt
                    </a>

                    {/* Review Buttons for each item */}
                    {order.items?.map((item) => {
                      // Handle both populated and non-populated product references
                      const productId =
                        typeof item.product === "string"
                          ? item.product
                          : item.product._id || item.product;
                      const hasReviewed =
                        reviewedProducts.get(productId) === true;
                      const canWriteReview = canReview(order, productId);

                      // Get product name for the modal
                      const productName =
                        typeof item.product === "string"
                          ? "Product"
                          : item.product.productName || "Product";

                      // console.log(`Product ${productId}:`, {
                      //   hasReviewed,
                      //   canWriteReview,
                      //   orderStatus: order.status,
                      // }); // Debug log

                      return (
                        <button
                          key={`review-${productId}`}
                          onClick={() =>
                            openReviewModal(productId, productName)
                          }
                          disabled={!canWriteReview && !hasReviewed}
                          className={`flex items-center px-4 py-2 rounded-lg font-medium transition duration-200 ${
                            hasReviewed
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 cursor-default"
                              : canWriteReview
                              ? "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              : "border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                          }`}
                          title={
                            hasReviewed
                              ? "You have already reviewed this product"
                              : !canWriteReview
                              ? "Product must be delivered to write a review"
                              : "Write a review for this product"
                          }
                        >
                          <FaStar className="mr-2" />
                          {hasReviewed ? "Reviewed" : "Write Review"}
                          {hasReviewed && <FaCheck className="ml-2" />}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition duration-200"
                    >
                      <FaRedo className="mr-2" />
                      Reorder
                    </button>

                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium transition duration-200"
                      >
                        <FaTimes className="mr-2" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onRequestClose={() => setReviewModalOpen(false)}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-6xl mx-auto mt-10 max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4"
        closeTimeoutMS={200}
      >
        <ReviewModal
          productId={selectedProductId}
          productName={selectedProductName}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={submitReview}
          hasReviewed={reviewedProducts.get(selectedProductId) === true}
        />
      </Modal>
    </>
  );
}
