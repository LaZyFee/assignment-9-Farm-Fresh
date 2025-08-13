import Review from "@/model/Review";
import Product from "@/model/Product";
import { auth } from "@/auth";

export default async function handler(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await auth();
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const { rating, text } = req.body;
    const userId = session.user.id;

    try {
        const review = await Review.findById(id);
        if (!review || review.user.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized to edit this review" });
        }

        review.rating = rating;
        review.text = text;
        await review.save();

        // Update product rating
        const reviews = await Review.find({ product: review.product });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(review.product, {
            rating: avgRating.toFixed(1),
            reviewsCount: reviews.length,
        });

        return res.status(200).json(review);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}