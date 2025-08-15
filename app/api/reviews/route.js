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
                { error: "Invalid product ID or rating" },
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
            comment: comment?.trim() || "",
        });

        await review.save();

        // Update product rating and review count
        const allReviews = await Review.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        // Fix: Use proper ObjectId conversion and correct update syntax
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
            { message: "Review submitted successfully", review },
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

// Get reviews for a product or user
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        // Validate ObjectId formats if provided
        if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
        }
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
        }

        // Check if user has reviewed a specific product
        if (productId && userId) {
            const existingReview = await Review.findOne({
                product: productId,
                user: userId,
            });

            return NextResponse.json({ hasReviewed: !!existingReview });
        }

        // Get all reviews for a product with pagination
        if (productId) {
            const skip = (page - 1) * limit;

            const reviews = await Review.find({ product: productId, status: 'active' })
                .populate('user', 'name image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalReviews = await Review.countDocuments({ product: productId, status: 'active' });
            const hasMore = skip + reviews.length < totalReviews;

            return NextResponse.json({
                reviews,
                totalReviews,
                hasMore,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit)
            });
        }

        // Get all reviews by a user
        if (userId) {
            const skip = (page - 1) * limit;

            const reviews = await Review.find({ user: userId, status: 'active' })
                .populate('product', 'productName images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalReviews = await Review.countDocuments({ user: userId, status: 'active' });
            const hasMore = skip + reviews.length < totalReviews;

            return NextResponse.json({
                reviews,
                totalReviews,
                hasMore,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit)
            });
        }

        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}