
import { dbConnect } from "@/service/mongo";
import userModel from "@/model/user-model";
import { sendResetEmail } from "@/lib/sendEmail";

export async function POST(req) {
    console.log("=== FORGET PASSWORD API CALLED ===");

    try {
        const body = await req.json();
        const { email } = body;

        console.log("Request body:", body);
        console.log("Email:", email);

        if (!email) {
            console.log("No email provided");
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log("Connecting to database...");
        await dbConnect();
        console.log("Database connected");

        console.log("Looking for user with email:", email);
        const user = await userModel.findOne({ email });
        console.log("User found:", user ? "YES" : "NO");

        if (!user) {
            console.log("User not found, but sending generic response");
            // Return generic message to prevent email enumeration
            return new Response(
                JSON.stringify({ message: "If the email exists, a reset link has been sent" }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log("Generating reset token...");
        // Generate and save reset token
        const resetToken = user.generateResetToken();
        await user.save();
        console.log("Reset token generated and saved");

        console.log("Sending reset email...");
        // Send reset email
        await sendResetEmail(email, resetToken);
        console.log("Reset email sent successfully");

        return new Response(
            JSON.stringify({ message: "If the email exists, a reset link has been sent" }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error("=== FORGET PASSWORD ERROR ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        return new Response(
            JSON.stringify({ error: "Something went wrong" }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle other HTTP methods
export async function GET(req) {
    return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}