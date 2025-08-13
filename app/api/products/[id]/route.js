import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findById(id)
            .populate(
                "farmer",
                "farmName profilePicture firstName lastName createdAt address bio farmSize specialization"
            );

        // console.log("API returning product:", product);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
