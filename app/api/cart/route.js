import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import User from "@/model/user-model";
import Product from "@/model/product-model";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
        .populate({
            path: "cart.product",
            populate: { path: "farmer", select: "firstName lastName" },
            strictPopulate: false
        })
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

    if (!action || !["add", "remove", "update", "clear"].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if ((action === "add" || action === "update") && (!productId || !quantity)) {
        return NextResponse.json({ error: "Product ID and quantity required" }, { status: 400 });
    }

    if (action === "remove" && !productId) {
        return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.cart)) {
        user.cart = [];
    }

    try {
        if (action === "clear") {
            user.cart = [];
        } else if (action === "add") {
            // Get the product to check farmer and stock
            const product = await Product.findById(productId).populate('farmer', 'firstName lastName');
            if (!product) {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

            // Check if product is from same farmer (if cart has items)
            if (user.cart.length > 0) {
                const existingCartProduct = await Product.findById(user.cart[0].product);
                if (existingCartProduct && String(existingCartProduct.farmer) !== String(product.farmer._id)) {
                    return NextResponse.json({
                        error: "You can only add products from the same farmer to your cart."
                    }, { status: 400 });
                }
            }

            // Check if product already exists in cart
            const existingIndex = user.cart.findIndex(
                (item) => item.product.toString() === productId
            );

            if (existingIndex > -1) {
                // Update quantity if product exists
                const newQuantity = user.cart[existingIndex].quantity + quantity;

                //  stock availability
                if (newQuantity > product.stock) {
                    return NextResponse.json({
                        error: `Cannot add more ${product.productName}. Only ${product.stock} ${product.unit} available.`
                    }, { status: 400 });
                }

                user.cart[existingIndex].quantity = newQuantity;
            } else {
                // Add new product to cart
                if (quantity > product.stock) {
                    return NextResponse.json({
                        error: `Cannot add ${quantity} ${product.unit} of ${product.productName}. Only ${product.stock} ${product.unit} available.`
                    }, { status: 400 });
                }

                user.cart.push({ product: productId, quantity });
            }

        } else if (action === "remove") {
            const existingIndex = user.cart.findIndex(
                (item) => item.product.toString() === productId
            );

            if (existingIndex > -1) {
                user.cart.splice(existingIndex, 1);
            }

        } else if (action === "update") {
            const existingIndex = user.cart.findIndex(
                (item) => item.product.toString() === productId
            );

            if (existingIndex > -1) {
                if (quantity <= 0) {
                    user.cart.splice(existingIndex, 1);
                } else {
                    // Check stock availability
                    const product = await Product.findById(productId);
                    if (product && quantity > product.stock) {
                        return NextResponse.json({
                            error: `Cannot update to ${quantity} ${product.unit}. Only ${product.stock} ${product.unit} available.`
                        }, { status: 400 });
                    }

                    user.cart[existingIndex].quantity = quantity;
                }
            }
        }

        await user.save();

        const updatedUser = await User.findById(session.user.id)
            .populate({
                path: "cart.product",
                populate: { path: "farmer", select: "firstName lastName" },
                strictPopulate: false
            })
            .select("cart")
            .lean();

        return NextResponse.json(updatedUser?.cart || []);

    } catch (error) {
        console.error("Cart operation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}