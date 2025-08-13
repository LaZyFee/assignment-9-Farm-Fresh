"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then(setOrder);
    }
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Payment Successful!</h1>
      <p>Thank you for your order</p>
      <p>Order #{order._id}</p>
      <div>Email Confirmation Sent</div>
      <div>Order Details</div>
      {order.items.map((item) => (
        <div key={item.product._id} className="item">
          <div>{item.product.productName}</div>
          <div>By {item.product.farmer.farmName || "Farm"}</div>
          <div>Quantity: {item.quantity} kg</div>
          <div>৳{item.price * item.quantity}</div>
        </div>
      ))}
      <div>Delivery Information</div>
      <div>
        Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
      </div>
      <div>Delivery Time: {order.deliveryTime}</div>
      <div>Address: {order.deliveryAddress}</div>
      <div>Payment Summary</div>
      <div>
        Subtotal: ৳
        {order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
      </div>
      <div>Delivery Fee: ৳50</div>
      <div>Service Fee: ৳25</div>
      <div>Total Paid: ৳{order.total}</div>
      <div>Payment Method: {order.paymentMethod}</div>
      <div>Transaction ID: {order.transactionId}</div>
      <a href={`/api/invoice/${order._id}`} download>
        Download Receipt (PDF)
      </a>
      <a href="/bookings">View All Orders</a>
      <a href="/">Back to Home</a>
    </div>
  );
}
