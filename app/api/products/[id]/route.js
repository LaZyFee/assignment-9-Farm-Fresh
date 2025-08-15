import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";
import Review from "@/model/Review";
import User from "@/model/user-model";

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Fetch the product and populate the farmer info
        const product = await Product.findById(id)
            .populate(
                "farmer",
                "farmName profilePicture firstName lastName createdAt address bio farmSize specialization"
            )
            .lean();

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Fetch reviews for this product with user info
        const reviews = await Review.find({ product: id })
            .populate("user", "firstName lastName profilePicture _id")
            .select("rating comment createdAt updatedAt user")
            .lean();

        // reviews array to product object
        product.reviews = reviews;

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
