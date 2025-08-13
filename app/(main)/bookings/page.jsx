"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import Modal from "react-modal";

export default function BookingsPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders(
        orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const handleCancel = (orderId) => handleStatusChange(orderId, "cancelled");

  const handleReorder = (order) => {
    // Add items to cart
    order.items.forEach((item) =>
      addToCart({ product: item.product, quantity: item.quantity })
    );
    // Set checkout info
    useCheckoutStore.setState({
      deliveryAddress: order.deliveryAddress,
      deliveryDate: order.deliveryDate.split("T")[0],
      deliveryTime: order.deliveryTime,
    });
    // Navigate to payment
    router.push("/payment");
  };

  const openReviewModal = (productId) => {
    setCurrentProduct(productId);
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: currentProduct, rating, comment }),
    });
    if (res.ok) {
      setReviewModalOpen(false);
      setComment("");
      setRating(5);
    }
  };

  return (
    <div className="container">
      <h1>My Orders</h1>
      {orders.map((order) => (
        <div key={order._id} className="order">
          <div>Order #{order._id}</div>
          <div>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
          <div>Status: {order.status}</div>
          <div>Total: ৳{order.total}</div>
          {order.items.map((item) => (
            <div key={item.product._id}>
              <div>{item.product.productName}</div>
              <div>By {item.product.farmer.farmName || "Farm"}</div>
              <div>
                Quantity: {item.quantity} {item.product.unit} • ৳{item.price}/
                {item.product.unit}
              </div>
              <div>৳{item.price * item.quantity}</div>
            </div>
          ))}
          {session.user.userType === "customer" ? (
            <>
              {/* Status steps from HTML */}
              <div className="status-steps">
                <div className={order.status === "pending" ? "active" : ""}>
                  Order Placed
                </div>
                <div className={order.status === "confirmed" ? "active" : ""}>
                  Confirmed
                </div>
                <div className={order.status === "shipped" ? "active" : ""}>
                  Shipped
                </div>
                <div className={order.status === "delivered" ? "active" : ""}>
                  Delivered
                </div>
              </div>
              <a href={`/api/invoice/${order._id}`} download>
                Download Receipt
              </a>
              {order.items.map((item) => (
                <button
                  key={item.product._id}
                  onClick={() => openReviewModal(item.product._id)}
                >
                  Write Review for {item.product.productName}
                </button>
              ))}
              <button onClick={() => handleReorder(order)}>Reorder</button>
              {order.status === "pending" && (
                <button onClick={() => handleCancel(order._id)}>
                  Cancel Order
                </button>
              )}
            </>
          ) : (
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      ))}
      <Modal
        isOpen={reviewModalOpen}
        onRequestClose={() => setReviewModalOpen(false)}
      >
        <h2>Write Review</h2>
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
        >
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={submitReview}>Submit</button>
      </Modal>
      {/* Pagination */}
    </div>
  );
}
