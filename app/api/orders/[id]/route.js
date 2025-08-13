import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const order = await Order.findById(params.id).populate('items.product');
    if (!order || (order.user.toString() !== session.user.id && session.user.userType !== 'farmer')) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(order);
}

// For status update, cancel, etc.
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { status } = await request.json();
    await dbConnect();
    const order = await Order.findById(params.id).populate('items.product');
    if (!order) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    // Check permission
    if (session.user.userType === 'farmer') {
        // Check if all items are from this farmer
        if (!order.items.every(item => item.product.farmer.toString() === session.user.id)) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else if (order.user.toString() !== session.user.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    order.status = status;
    if (status === 'cancelled') {
        // Return stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            product.stock += item.quantity;
            product.salesCount -= item.quantity;
            await product.save();
        }
    }
    await order.save();
    return Response.json(order);
}