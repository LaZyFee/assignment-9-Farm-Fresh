import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: true,
        },
        helpfulCount: {
            type: Number,
            default: 0,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["active", "hidden", "reported"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

//  index for efficient querying
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);