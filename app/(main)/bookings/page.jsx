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
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders)
      .then(() => setLoading(false))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
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

  const openReviewModal = (productId, productName) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        rating,
        comment,
      }),
    });
    if (res.ok) {
      setReviewModalOpen(false);
      setComment("");
      setRating(5);
    }
  };

  if (Loading) {
    return <div>loading ....</div>;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-primary-600">
                Home
              </a>
            </li>
            <li>
              <FaChevronRight className="text-gray-400 text-xs" />
            </li>
            <li className="text-gray-900 dark:text-white">My Orders</li>
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
              Track and manage your orders
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option>All Orders</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order._id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <FaCheckCircle className="mr-1" />
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ৳{order.total}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  {order.items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center space-x-4 mb-4"
                    >
                      <Image
                        src={item.product.images?.[0] || "/placeholder.jpg"}
                        alt={item.product.productName}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.product.productName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          By {item.product.farmer?.farmName || "Farm"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} {item.product.unit} • ৳
                          {item.price}/{item.product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Status */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Order Status
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    {["pending", "confirmed", "shipped", "delivered"].map(
                      (step, i) => {
                        const isActive = order.status === step;
                        const isCompleted =
                          ["confirmed", "shipped", "delivered"].includes(
                            order.status
                          ) && step !== "pending";
                        return (
                          <div key={step} className="flex items-center">
                            {isCompleted || order.status === step ? (
                              <FaCheckCircle className="mr-1 text-green-600" />
                            ) : step === "pending" &&
                              order.status === "pending" ? (
                              <FaClock className="mr-1 text-yellow-600" />
                            ) : (
                              <FaCircle className="mr-1 text-gray-400" />
                            )}
                            <span>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                            {i < 3 && (
                              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 ml-2"></div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex flex-wrap gap-3">
                  <a
                    href={`/api/invoice/${order._id}`}
                    download
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
                  >
                    <FaDownload className="mr-2" />
                    Download Receipt
                  </a>
                  {order.items.map((item) => (
                    <button
                      key={item.product._id}
                      onClick={() =>
                        openReviewModal(
                          item.product._id,
                          item.product.productName
                        )
                      }
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
               text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
               rounded-lg font-medium transition"
                    >
                      <FaStar className="mr-2" />
                      Write Review
                    </button>
                  ))}

                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition"
                  >
                    <FaRedo className="mr-2" />
                    Reorder
                  </button>
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="flex items-center px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium transition"
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
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onRequestClose={() => setReviewModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
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
        />
      </Modal>
    </>
  );
}
