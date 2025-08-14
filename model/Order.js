import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        total: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
        deliveryFee: { type: Number, default: 50, min: 0 },
        serviceFee: { type: Number, default: 25, min: 0 },
        deliveryAddress: { type: String, required: true, trim: true },
        deliveryDate: { type: Date, required: true },
        deliveryTime: { type: String, required: true },
        paymentMethod: { type: String, required: true, enum: ["cod", "bkash", "nagad", "rocket", "credit"] },
        transactionId: { type: String, unique: true, sparse: true },
    },
    {
        timestamps: true,
        indexes: [
            { user: 1, createdAt: -1 },
            { status: 1 },
            { "items.product": 1 }
        ]
    }
);

orderSchema.pre('save', function (next) {
    if (!this.transactionId) {
        this.transactionId = `TXN-FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);