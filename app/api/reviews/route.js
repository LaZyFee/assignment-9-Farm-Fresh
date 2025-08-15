import Review from "@/model/Review";
import Product from "@/model/product-model";
import Order from "@/model/Order";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { productId, rating, comment } = await req.json();
        const userId = session.user.id;

        // Validate input
        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Invalid product ID or rating. Rating must be between 1 and 5." },
                { status: 400 }
            );
        }

        if (!comment || !comment.trim()) {
            return NextResponse.json(
                { error: "Review comment is required." },
                { status: 400 }
            );
        }

        // Validate ObjectId formats
        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: "Invalid ID format" },
                { status: 400 }
            );
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify user has purchased this product
        const order = await Order.findOne({
            user: userId,
            "items.product": productId,
            status: { $in: ["delivered", "completed"] },
        });

        if (!order) {
            return NextResponse.json(
                { error: "You must purchase and receive the product to review it" },
                { status: 403 }
            );
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId,
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this product" },
                { status: 409 }
            );
        }

        // Create new review
        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment: comment.trim(),
        });

        await review.save();

        // Populate user data
        await review.populate('user', 'firstName lastName profilePicture _id');

        // Recalculate product rating and review count
        const allReviews = await Review.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        // Update product with new rating and review count
        await Product.findByIdAndUpdate(
            productId,
            {
                $push: {
                    reviews: {
                        reviewId: new mongoose.Types.ObjectId(review._id),
                        reviewedBy: new mongoose.Types.ObjectId(userId)
                    }
                },
                rating: parseFloat(avgRating.toFixed(1)),
                reviewsCount: allReviews.length
            },
            { new: true }
        );

        return NextResponse.json(
            {
                message: "Review submitted successfully",
                review: {
                    _id: review._id,
                    rating: review.rating,
                    comment: review.comment,
                    user: review.user,
                    product: review.product,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}