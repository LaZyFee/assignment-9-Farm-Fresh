import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import Product from "@/model/product-model";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function GET(req) {
    try {
        // Step 1: Check authentication
        const session = await auth();
        // console.log("Session data:", session);
        if (!session || !session.user || session.user.userType !== "farmer") {
            console.error("Unauthorized access attempt:", { session });
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Connect to database
        await dbConnect();
        // console.log("Connected to MongoDB for GET request");

        // Step 3: Build query
        const { searchParams } = new URL(req.url);
        const query = { farmer: session.user.id };
        // console.log("Query base:", query);

        // Search by name/description
        const search = searchParams.get("search");
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by category
        const category = searchParams.get("category");
        if (category && category !== "All Categories") query.category = category;

        // Filter by status
        const status = searchParams.get("status");
        if (status && status !== "All Status") {
            if (status === "Active") query.status = "active";
            if (status === "Inactive") query.status = "inactive";
            if (status === "Out of Stock") query.stock = 0;
            if (status === "Low Stock") query.stock = { $gt: 0, $lt: 10 };
        }
        // console.log("Final query:", query);

        // Step 4: Execute query
        const products = await Product.find(query).sort({ createdAt: -1 });
        // console.log("Products fetched:", products.length);
        return NextResponse.json(products);
    } catch (error) {
        console.error("GET /api/my-products error:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: "Failed to fetch products", details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        // console.log("Session data for PATCH:", session);
        if (!session || !session.user || session.user.userType !== "farmer") {
            console.error("Unauthorized PATCH attempt:", { session });
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        // console.log("Connected to MongoDB for PATCH request");

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("id");
        if (!productId) {
            console.error("Missing product ID in PATCH request");
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const product = await Product.findOne({ _id: productId, farmer: session.user.id });
        if (!product) {
            console.error("Product not found:", { productId, farmer: session.user.id });
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const formData = await req.formData();
        const action = formData.get("action");
        if (action === "toggle") {
            product.status = product.status === "active" ? "inactive" : "active";
            await product.save();
            // console.log("Status toggled for product:", productId);
            return NextResponse.json({ message: "Status toggled", product });
        }

        const updates = {};
        const productName = formData.get("productName");
        if (productName) updates.productName = productName;
        const category = formData.get("category");
        if (category) updates.category = category;
        const description = formData.get("description");
        if (description) updates.description = description;
        const price = formData.get("price");
        if (price) updates.price = parseFloat(price);
        const unit = formData.get("unit");
        if (unit) updates.unit = unit;
        const stock = formData.get("stock");
        if (stock) updates.stock = parseInt(stock);
        const farmLocation = formData.get("farmLocation");
        if (farmLocation) updates.farmLocation = farmLocation;
        const harvestDate = formData.get("harvestDate");
        if (harvestDate) updates.harvestDate = harvestDate || null;
        const features = formData.getAll("features[]");
        if (features.length > 0) updates.features = features;

        const images = formData.getAll("images");
        let newImagePaths = product.images;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        for (const image of images) {
            if (typeof image === "string") continue;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileName = `${Date.now()}-${image.name}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            newImagePaths.push(`/uploads/${fileName}`);
        }
        if (images.length > 0) updates.images = newImagePaths;

        // console.log("Applying updates:", updates);
        await Product.updateOne({ _id: productId }, { $set: updates });
        const updatedProduct = await Product.findById(productId);
        // console.log("Product updated:", productId);
        return NextResponse.json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
        console.error("PATCH /api/my-products error:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: "Failed to update product", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const session = await auth();
        // console.log("Session data for DELETE:", session);
        if (!session || !session.user || session.user.userType !== "farmer") {
            console.error("Unauthorized DELETE attempt:", { session });
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        // console.log("Connected to MongoDB for DELETE request");

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("id");
        if (!productId) {
            console.error("Missing product ID in DELETE request");
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const product = await Product.findOne({ _id: productId, farmer: session.user.id });
        if (!product) {
            console.error("Product not found:", { productId, farmer: session.user.id });
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        product.images.forEach((imgPath) => {
            const fullPath = path.join(process.cwd(), "public", imgPath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });

        await Product.deleteOne({ _id: productId });
        // console.log("Product deleted:", productId);
        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        console.error("DELETE /api/my-products error:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: "Failed to delete product", details: error.message },
            { status: 500 }
        );
    }
}