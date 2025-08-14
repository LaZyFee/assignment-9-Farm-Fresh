"use client";

import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import Link from "next/link";
import Image from "next/image";
import {
  FaChevronRight,
  FaCreditCard,
  FaEdit,
  FaInfoCircle,
  FaLock,
  FaMapMarker,
  FaMapMarkerAlt,
  FaMinus,
  FaMobileAlt,
  FaPlus,
  FaSave,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaWallet,
} from "react-icons/fa";

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
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const defaultAddress =
        session.user.address || "Please enter your address";
      const defaultDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const defaultTime = "10:00 AM - 12:00 PM";

      checkout.setDeliveryInfo({
        deliveryAddress: defaultAddress,
        deliveryDate: defaultDate,
        deliveryTime: defaultTime,
      });
      setTempAddress(defaultAddress);
      setTempDate(defaultDate);
      setTempTime(defaultTime);
      setTempCart([...cart]);
    }
  }, [session, cart]);

  // Calculate totals based on actual product data structure
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
    setIsLoading(true);

    // Validation
    if (cart.length === 0) {
      alert("Your cart is empty");
      setIsLoading(false);
      return;
    }

    if (
      !checkout.deliveryAddress ||
      checkout.deliveryAddress === "Please enter your address"
    ) {
      alert("Please enter a valid delivery address");
      setIsLoading(false);
      return;
    }

    if (
      paymentMethod === "credit" &&
      (!cardName || !cardNumber || !expiry || !cvv)
    ) {
      alert("Please fill in all card details");
      setIsLoading(false);
      return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !mobile) {
      alert("Please enter your mobile number");
      setIsLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product._id,
          productName: item.product.productName,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit,
          farmer: item.product.farmer,
          image:
            item.product.images && item.product.images[0]
              ? item.product.images[0]
              : null,
        })),
        deliveryAddress: checkout.deliveryAddress,
        deliveryDate: checkout.deliveryDate,
        deliveryTime: checkout.deliveryTime,
        paymentMethod,
        paymentDetails: {
          ...(paymentMethod === "credit" && {
            cardName,
            cardNumber: cardNumber.slice(-4),
          }),
          ...(["bkash", "nagad"].includes(paymentMethod) && { mobile }),
        },
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        userId: session?.user?.id,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const { orderId } = await res.json();
        clearCart();
        router.push(`/success?order=${orderId}`);
      } else {
        const { error } = await res.json();
        alert(error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const imagePath = product.images[0];
      // If it's a relative path, prepend the base URL
      if (imagePath.startsWith("/uploads/")) {
        return `${process.env.NEXT_PUBLIC_API_URL || ""}${imagePath}`;
      }
      return imagePath;
    }
    // Fallback image
    return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop";
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h2>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
          </li>
          <li>
            <FaChevronRight className="text-gray-400 text-xs"></FaChevronRight>
          </li>
          <li>
            <Link
              href="/products"
              className="text-gray-500 hover:text-primary-600"
            >
              Products
            </Link>
          </li>
          <li>
            <FaChevronRight className=" text-gray-400 text-xs"></FaChevronRight>
          </li>
          <li className="text-gray-900 dark:text-white">Payment</li>
        </ol>
      </nav>

      {/* Payment Process */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <Image
                  src={getImageUrl(item.product)}
                  alt={item.product.productName}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.product.productName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.product.farmLocation &&
                      `From ${item.product.farmLocation}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity} {item.product.unit}
                  </p>
                  {item.product.features &&
                    item.product.features.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {item.product.features.slice(0, 3).join(", ")}
                      </p>
                    )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ৳{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ৳{item.product.price}/{item.product.unit}
                  </p>
                </div>
              </div>
            ))}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Booking Date:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Date:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {checkout.deliveryDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Address:
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
                  {checkout.deliveryAddress}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ৳{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Fee:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ৳{deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Service Fee:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ৳{serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                <span>Total:</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={openModal}
              className="w-full mt-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium transition flex items-center justify-center"
            >
              <FaEdit className="mr-2"></FaEdit>Edit Order Details
            </button>
          </div>

          {/* Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={paymentMethod === "credit"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <FaCreditCard className="text-lg mr-2"></FaCreditCard>
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === "bkash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <FaMobileAlt className="text-lg mr-2"></FaMobileAlt>
                      <span className="font-medium">bKash</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentMethod === "nagad"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex items-center">
                      <FaWallet className="text-lg mr-2"></FaWallet>
                      <span className="font-medium">Nagad</span>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === "credit" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="cardName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiry"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        CVV *
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength="4"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You will receive a payment request on your{" "}
                      {paymentMethod === "bkash" ? "bKash" : "Nagad"} app.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={() => setSameAsDelivery(!sameAsDelivery)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Same as delivery address
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-lg transition duration-200 transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 hover:scale-105"
                } text-white`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="mr-2"></FaSpinner>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaLock className="mr-2"></FaLock>
                    Complete Payment - ৳{total.toFixed(2)}
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <FaShieldAlt className="mr-2"></FaShieldAlt>
                Your payment information is secure and encrypted
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-white dark:bg-gray-800 rounded-2xl p-0 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Order Details
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FaTimes className="text-xl"></FaTimes>
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Address
              </label>
              <textarea
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your complete delivery address including area, landmark, and contact details..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please provide detailed address for accurate delivery
              </p>
            </div>

            {/* Delivery Schedule Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaInfoCircle className="text-blue-500 mr-2"></FaInfoCircle>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Delivery Schedule Information
                </h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Delivery dates and times are set by individual farmers based on
                harvest schedules and availability.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">
                    Estimated Delivery Date:
                  </span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {tempDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">
                    Delivery Time Window:
                  </span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {tempTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {tempCart.map((item, index) => (
                  <div
                    key={item.product._id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={getImageUrl(item.product)}
                        alt={item.product.productName}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.product.productName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ৳{item.product.price}/{item.product.unit}
                      </p>
                      {item.product.farmLocation && (
                        <p className="text-sm text-green-600 dark:text-green-400  flex items-center">
                          <FaMapMarkerAlt className="mr-1"></FaMapMarkerAlt>
                          {item.product.farmLocation}
                        </p>
                      )}
                      {item.product.stock && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Available: {item.product.stock} {item.product.unit}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (tempCart[index].quantity > 1) {
                            const newCart = [...tempCart];
                            newCart[index].quantity -= 1;
                            setTempCart(newCart);
                          }
                        }}
                        disabled={tempCart[index].quantity <= 1}
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition"
                      >
                        <FaMinus className="text-sm"></FaMinus>
                      </button>

                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newCart = [...tempCart];
                            const value = Math.max(
                              1,
                              Math.min(
                                item.product.stock,
                                parseInt(e.target.value) || 1
                              )
                            );
                            newCart[index].quantity = value;
                            setTempCart(newCart);
                          }}
                          min={1}
                          max={item.product.stock}
                          className="w-20 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                          {item.product.unit}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (tempCart[index].quantity < item.product.stock) {
                            const newCart = [...tempCart];
                            newCart[index].quantity += 1;
                            setTempCart(newCart);
                          }
                        }}
                        disabled={
                          tempCart[index].quantity >= item.product.stock
                        }
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition"
                      >
                        <FaPlus className="text-sm"></FaPlus>
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ৳{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCart = tempCart.filter(
                            (_, i) => i !== index
                          );
                          setTempCart(newCart);
                        }}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                        title="Remove item"
                      >
                        <FaTrash className="text-sm"></FaTrash>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Updated Subtotal:
                  </span>
                  <span className="text-primary-600 dark:text-primary-400">
                    ৳
                    {tempCart
                      .reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={saveChanges}
              className=" flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition duration-200 transform hover:scale-105"
            >
              <FaSave className="mr-2"></FaSave>
              Save Changes
            </button>
            <button
              onClick={closeModal}
              className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition duration-200"
            >
              <FaTimes className="mr-2"></FaTimes>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
