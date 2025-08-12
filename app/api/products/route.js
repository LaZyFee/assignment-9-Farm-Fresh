import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";
import fs from "fs";
import path from "path";
import { auth } from "@/auth";

export async function POST(req) {
    const session = await auth();
    if (!session || session.user.userType !== "farmer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
            if (typeof image === "string") continue;

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
            farmer: session.user.id || session.user._id,
            status: "active",
            rating: 0,
            reviewsCount: 0
        });
        // Add product to user
        await User.findByIdAndUpdate(
            session.user.id || session.user._id,
            { $push: { products: newProduct._id } },
            { new: true }
        );
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
export async function GET(req) {
    try {
        await dbConnect();
        const products = await Product.find({}).populate("farmer", "firstName lastName");
        // console.log("API returning products:", products);
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}