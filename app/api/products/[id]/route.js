import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const product = await Product.findById(params.id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}
