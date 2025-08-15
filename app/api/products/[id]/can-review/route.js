import Order from "@/model/Order";
import Review from "@/model/Review";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const session = await auth();
    if (!session) {
        console.error("Unauthorized access attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;
    const userId = session.user.id;

    try {
        const order = await Order.findOne({
            user: userId,
            "items.product": id,
            status: "delivered",
        });

        const existingReview = await Review.findOne({
            product: id,
            user: userId,
        });

        if (!order || existingReview) {
            const reason = !order
                ? "Product must be purchased and delivered"
                : "You have already reviewed this product";

            // console.log("Can review: false | Reason:", reason);

            return NextResponse.json({
                canReview: false,
                reason,
            });
        }

        // console.log("Can review: true");
        return NextResponse.json({ canReview: true });

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
