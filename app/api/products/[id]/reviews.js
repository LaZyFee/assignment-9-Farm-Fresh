import Review from "@/model/Review";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export default async function handler(req, res) {
    const { id } = req.query;
    const { page = 1, limit = 5 } = req.query;
    const session = await auth();
    if (!session || session.user.userType !== "farmer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect(); const userId = session?.user?.id;

    try {
        const skip = (page - 1) * limit;

        // Fetch the user's review (if exists) to display it at the top
        const userReview = userId
            ? await Review.findOne({ product: id, user: userId }).populate("user", "name image")
            : null;

        // Fetch other reviews, excluding the user's review
        const query = { product: id };
        if (userReview) {
            query._id = { $ne: userReview._id };
        }

        const reviews = await Review.find(query)
            .populate("user", "name image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await Review.countDocuments({ product: id });

        return res.status(200).json({
            reviews: userReview ? [userReview, ...reviews] : reviews,
            totalReviews,
            hasMore: skip + reviews.length < totalReviews,
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
}