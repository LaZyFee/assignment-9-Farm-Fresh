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
    },
    { timestamps: true }
);

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
