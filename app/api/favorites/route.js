import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import User from "@/model/user-model";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
        .select("favorites")
        .lean();

    return Response.json(user.favorites || []);
}

export async function POST(request) {
    const session = await auth();
    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, action } = await request.json();
    if (!productId || !["add", "remove"].includes(action)) {
        return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.favorites)) {
        user.favorites = [];
    }

    if (action === "add") {
        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
        }
    } else {
        user.favorites = user.favorites.filter(
            (id) => id.toString() !== productId
        );
    }

    await user.save();

    return Response.json(user.favorites.map((id) => id.toString()));
}

