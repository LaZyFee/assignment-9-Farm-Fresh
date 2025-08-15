import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import Review from "@/model/Review";
import mongoose from "mongoose";

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 5;
        const { id: productId } = params;

        const session = await auth();
        const userId = session?.user?.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { error: "Invalid product ID format" },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        // First, get user's review if they're logged in
        let userReview = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            userReview = await Review.findOne({
                product: productId,
                user: userId
            }).populate('user', 'firstName lastName profilePicture _id');
        }

        // Then get other reviews, excluding user's review if it exists
        const query = { product: productId };
        if (userReview) {
            query._id = { $ne: userReview._id };
        }

        const otherReviews = await Review.find(query)
            .populate('user', 'firstName lastName profilePicture _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Combine reviews with user's review first if it exists and we're on page 1
        let reviews = [];
        if (page === 1 && userReview) {
            reviews = [userReview, ...otherReviews];
        } else {
            reviews = otherReviews;
        }

        // Get total count for pagination
        const totalReviews = await Review.countDocuments({ product: productId });
        const totalOtherReviews = userReview ? totalReviews - 1 : totalReviews;

        // Calculate if there are more pages
        let hasMore = false;
        if (page === 1 && userReview) {
            // On first page with user review, check if there are more other reviews
            hasMore = otherReviews.length === limit && skip + otherReviews.length < totalOtherReviews;
        } else {
            // On other pages or no user review, standard pagination
            hasMore = skip + otherReviews.length < totalOtherReviews;
        }

        return NextResponse.json({
            reviews,
            totalReviews,
            hasMore,
            currentPage: page,
            hasUserReview: !!userReview
        });

    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}