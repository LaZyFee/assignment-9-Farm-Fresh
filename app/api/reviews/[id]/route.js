import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import Review from "@/model/Review";
import Product from "@/model/product-model";
import mongoose from "mongoose";

// Update review
export async function PUT(req, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { rating, comment } = await req.json();
        const userId = session.user.id;
        const { id } = params;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Invalid rating" },
                { status: 400 }
            );
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid review ID format" },
                { status: 400 }
            );
        }

        // Find and verify review ownership
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }

        if (review.user.toString() !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to edit this review" },
                { status: 403 }
            );
        }

        // Update review
        review.rating = rating;
        review.comment = comment?.trim() || "";
        await review.save();

        // Update product rating and review count
        const allReviews = await Review.find({ product: review.product });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Product.findByIdAndUpdate(
            review.product,
            {
                rating: parseFloat(avgRating.toFixed(1)),
                reviewsCount: allReviews.length
            },
            { new: true }
        );

        return NextResponse.json(
            { message: "Review updated successfully", review },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete review
export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userId = session.user.id;
        const { id } = params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid review ID format" },
                { status: 400 }
            );
        }

        // Find and verify review ownership
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }

        if (review.user.toString() !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to delete this review" },
                { status: 403 }
            );
        }

        const productId = review.product;

        // Delete review
        await Review.findByIdAndDelete(id);

        // Remove review from product's reviews array
        await Product.findByIdAndUpdate(
            productId,
            {
                $pull: {
                    reviews: {
                        reviewId: new mongoose.Types.ObjectId(id)
                    }
                }
            }
        );

        // Update product rating and review count
        const remainingReviews = await Review.find({ product: productId });
        const avgRating = remainingReviews.length
            ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
            : 0;

        await Product.findByIdAndUpdate(
            productId,
            {
                rating: parseFloat(avgRating.toFixed(1)),
                reviewsCount: remainingReviews.length
            },
            { new: true }
        );

        return NextResponse.json(
            { message: "Review deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}