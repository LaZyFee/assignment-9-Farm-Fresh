import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
        total: { type: Number, required: true },
        deliveryAddress: { type: String, required: true },
        deliveryDate: { type: Date, required: true },
        deliveryTime: { type: String, required: true },
        paymentMethod: { type: String, required: true },
        transactionId: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);