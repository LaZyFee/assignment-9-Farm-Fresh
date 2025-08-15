import Order from "@/model/Order";
import Review from "@/model/Review";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const userId = session.user.id;

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Check if user has purchased and received this product
        const order = await Order.findOne({
            user: userId,
            "items.product": productId,
            status: { $in: ["delivered", "completed"] },
        });

        if (!order) {
            return NextResponse.json({
                canReview: false,
                reason: "Product must be purchased and delivered to write a review"
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId,
        });

        if (existingReview) {
            return NextResponse.json({
                canReview: false,
                reason: "You have already reviewed this product"
            });
        }

        return NextResponse.json({
            canReview: true,
            reason: "You can review this product"
        });

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}