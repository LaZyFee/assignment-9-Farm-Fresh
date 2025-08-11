import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        unit: { type: String, required: true },
        stock: { type: Number, required: true },
        images: [{ type: String }],
        farmLocation: { type: String, required: true },
        harvestDate: { type: Date, default: null },
        features: [{ type: String }],
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
        rating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
