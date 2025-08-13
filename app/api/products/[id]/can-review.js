
import Order from "@/model/Order";
import Review from "@/model/Review";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export default async function handler(req, res) {
    const session = await auth();
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    await dbConnect();


    const { id } = req.query;
    const userId = session.user.id;

    try {
        // Check if the user has purchased the product
        const order = await Order.findOne({
            user: userId,
            "items.product": id,
            status: "completed",
        });

        // Check if the user has already reviewed the product
        const existingReview = await Review.findOne({
            product: id,
            user: userId,
        });

        return res.status(200).json({
            canReview: !!order && !existingReview,
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}