import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";
import fs from "fs";
import path from "path";

export async function POST(req) {
    try {
        await dbConnect();

        const formData = await req.formData();

        // Normal fields
        const productName = formData.get("productName");
        const category = formData.get("category");
        const description = formData.get("description");
        const price = parseFloat(formData.get("price"));
        const unit = formData.get("unit");
        const stock = parseInt(formData.get("stock"));
        const farmLocation = formData.get("farmLocation");
        const harvestDate = formData.get("harvestDate") || null;

        // Features (checkbox array)
        const features = formData.getAll("features[]");

        // Uploads directory
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Images upload
        const images = formData.getAll("images");
        let savedImagePaths = [];

        for (const image of images) {
            if (typeof image === "string") continue; // skip invalid

            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const fileName = `${Date.now()}-${image.name}`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, buffer);

            // Store relative path for DB
            savedImagePaths.push(`/uploads/${fileName}`);
        }

        // Save to DB
        const newProduct = await Product.create({
            productName,
            category,
            description,
            price,
            unit,
            stock,
            images: savedImagePaths,
            farmLocation,
            harvestDate,
            features,
        });

        return NextResponse.json(
            { message: "Product created successfully", product: newProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
