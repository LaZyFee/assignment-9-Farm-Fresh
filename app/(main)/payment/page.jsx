"use client";

import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";

export default function PaymentPage() {
  const { data: session } = useSession();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const checkout = useCheckoutStore((state) => state);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempCart, setTempCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      checkout.setDeliveryInfo({
        deliveryAddress: session.user.address,
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        deliveryTime: "10:00 AM - 12:00 PM",
      });
      setTempAddress(session.user.address);
      setTempDate(
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      );
      setTempTime("10:00 AM - 12:00 PM");
      setTempCart([...cart]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, cart]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = 50;
  const serviceFee = 25;
  const total = subtotal + deliveryFee + serviceFee;

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const saveChanges = () => {
    checkout.setDeliveryInfo({
      deliveryAddress: tempAddress,
      deliveryDate: tempDate,
      deliveryTime: tempTime,
    });
    useCartStore.setState({ cart: tempCart });
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Fake validation
    if (
      paymentMethod === "credit" &&
      (!cardName || !cardNumber || !expiry || !cvv)
    )
      return alert("Fill card details");
    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !mobile)
      return alert("Fill mobile");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        deliveryAddress: checkout.deliveryAddress,
        deliveryDate: checkout.deliveryDate,
        deliveryTime: checkout.deliveryTime,
        paymentMethod,
        total,
      }),
    });
    if (res.ok) {
      const { orderId } = await res.json();
      clearCart();
      router.push(`/success?order=${orderId}`);
    } else {
      const { error } = await res.json();
      alert(error);
    }
  };

  return (
    // Convert paymentProcess.html to JSX, loop over cart in order summary
    <div className="container">
      {/* Header, nav, etc. from HTML */}
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.map((item) => (
          <div key={item.product._id} className="item">
            <div>{item.product.productName}</div>
            <div>By {item.product.farmer.farmName || "Farm"}</div>
            <div>
              Quantity: {item.quantity} {item.product.unit}
            </div>
            <div>৳{item.product.price * item.quantity}</div>
            <div>
              ৳{item.product.price}/{item.product.unit}
            </div>
          </div>
        ))}
        <div>Booking Date: {new Date().toLocaleDateString()}</div>
        <div>Delivery Date: {checkout.deliveryDate}</div>
        <div>Delivery Address: {checkout.deliveryAddress}</div>
        <div>Subtotal: ৳{subtotal}</div>
        <div>Delivery Fee: ৳{deliveryFee}</div>
        <div>Service Fee: ৳{serviceFee}</div>
        <div>Total: ৳{total}</div>
        <button onClick={openModal}>Edit Order Details</button>
      </div>
      <div className="payment-info">
        <h2>Payment Information</h2>
        <form onSubmit={handleSubmit}>
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit">Credit/Debit Card</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>
          {paymentMethod === "credit" && (
            <>
              <input
                placeholder="Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
              <input
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <input
                placeholder="Expiry Date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              <input
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </>
          )}
          {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
            <input
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          )}
          <button type="submit">Complete Payment - ৳{total}</button>
        </form>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>Edit Order Details</h2>
        <label>Delivery Address</label>
        <input
          value={tempAddress}
          onChange={(e) => setTempAddress(e.target.value)}
        />
        <label>Delivery Date</label>
        <input
          type="date"
          value={tempDate}
          onChange={(e) => setTempDate(e.target.value)}
        />
        <label>Delivery Time</label>
        <input value={tempTime} onChange={(e) => setTempTime(e.target.value)} />
        <h3>Items</h3>
        {tempCart.map((item, index) => (
          <div key={item.product._id}>
            {item.product.productName}
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const newCart = [...tempCart];
                newCart[index].quantity = parseInt(e.target.value);
                setTempCart(newCart);
              }}
              min={1}
            />
          </div>
        ))}
        <button onClick={saveChanges}>Save</button>
        <button onClick={closeModal}>Cancel</button>
      </Modal>
    </div>
  );
}
