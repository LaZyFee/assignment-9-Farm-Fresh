import userModel from "@/model/user-model";
import { dbConnect } from "@/service/mongo";

export async function GET() {
    await dbConnect();

    try {
        const farmers = await userModel
            .find({ userType: "farmer" })
            .select("-password");

        return new Response(JSON.stringify(farmers), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error fetching farmers:", error);
        return new Response(
            JSON.stringify({ message: "Failed to fetch farmers" }),
            { status: 500 }
        );
    }
}
