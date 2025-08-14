import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import User from "@/model/user-model";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
        .populate({ path: "cart.product", strictPopulate: false })
        .select("cart")
        .lean();

    return NextResponse.json(user?.cart || []);
}

export async function POST(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, action } = await request.json();
    if (!productId || !["add", "remove", "update"].includes(action)) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.cart)) {
        user.cart = [];
    }

    const existingIndex = user.cart.findIndex(
        (item) => item.product.toString() === productId
    );

    if (action === "add" || action === "update") {
        const newQuantity = quantity || 1;
        if (existingIndex > -1) {
            user.cart[existingIndex].quantity += newQuantity;
            if (user.cart[existingIndex].quantity <= 0) {
                user.cart.splice(existingIndex, 1);
            }
        } else if (newQuantity > 0) {
            user.cart.push({ product: productId, quantity: newQuantity });
        }
    } else if (action === "remove") {
        if (existingIndex > -1) {
            user.cart.splice(existingIndex, 1);
        }
    }

    await user.save();

    const updatedUser = await User.findById(session.user.id)
        .populate({ path: "cart.product", strictPopulate: false })
        .select("cart")
        .lean();

    return NextResponse.json(updatedUser?.cart || []);
}