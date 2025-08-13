import Review from "@/model/Review";
import Product from "@/model/Product";
import Order from "@/model/Order";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await auth();
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    await dbConnect();

    const { productId, rating, text } = req.body;
    const userId = session.user.id;

    try {
        // Verify purchase
        const order = await Order.findOne({
            user: userId,
            "items.product": productId,
            status: "completed",
        });

        if (!order) {
            return res.status(403).json({ error: "You must purchase the product to review it" });
        }

        // Check if the user already reviewed
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(403).json({ error: "You have already reviewed this product" });
        }

        // Create new review
        const review = new Review({
            product: productId,
            user: userId,
            rating,
            text,
        });
        await review.save();

        // Update product rating and reviewsCount
        const reviews = await Review.find({ product: productId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(productId, {
            rating: avgRating.toFixed(1),
            reviewsCount: reviews.length,
        });

        return res.status(201).json(review);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}