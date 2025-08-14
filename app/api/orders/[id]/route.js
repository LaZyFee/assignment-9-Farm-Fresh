import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const orderId = params.id;

        // Validate ObjectId format
        if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
            return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                populate: {
                    path: 'farmer',
                    select: 'farmName name'
                }
            })
            .populate('user', 'name email phone');

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user has access to this order
        const hasAccess =
            order.user._id.toString() === session.user.id ||
            (session.user.userType === 'farmer' &&
                order.items.some(item =>
                    item.product.farmer &&
                    item.product.farmer._id.toString() === session.user.id
                )); // Farmer whose product is in the order

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order fetch error:", error);
        return NextResponse.json({
            error: "Failed to fetch order",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const orderId = params.id;
        const { status } = await request.json();

        // Validate ObjectId format
        if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
            return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
        }

        // Validate status
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                populate: {
                    path: 'farmer',
                    select: '_id'
                }
            });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user has permission to update this order
        const canUpdate =
            order.user.toString() === session.user.id || // Customer who placed the order (can cancel)
            session.user.userType === 'admin' || // Admin access
            (session.user.userType === 'farmer' &&
                order.items.some(item =>
                    item.product.farmer &&
                    item.product.farmer._id.toString() === session.user.id
                )); // Farmer whose product is in the order

        if (!canUpdate) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Additional validation based on current status and user type
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return NextResponse.json({
                error: "Cannot modify completed or cancelled orders"
            }, { status: 400 });
        }

        // Customers can only cancel pending orders
        if (session.user.userType === 'customer' &&
            !(order.status === 'pending' && status === 'cancelled')) {
            return NextResponse.json({
                error: "You can only cancel pending orders"
            }, { status: 403 });
        }

        order.status = status;
        await order.save();

        return NextResponse.json({
            message: "Order status updated successfully",
            order: {
                _id: order._id,
                status: order.status,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({
            error: "Failed to update order",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}