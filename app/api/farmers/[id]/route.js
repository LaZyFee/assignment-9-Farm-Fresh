import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";
import User from "@/model/user-model";

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Farmer ID is required" }, { status: 400 });
        }

        // Find the farmer to ensure they exist
        const farmer = await User.findById(id).notDeleted();
        if (!farmer) {
            return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
        }

        // Fetch products associated with the farmer
        const products = await Product.find({ farmer: id, status: "active" })
            .populate("farmer", "firstName lastName");

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching farmer's products:", error);
        return NextResponse.json(
            { error: "Failed to fetch farmer's products" },
            { status: 500 }
        );
    }
}