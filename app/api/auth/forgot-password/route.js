import { dbConnect } from "@/service/mongo";
import userModel from "@/model/user-model";
import { sendResetEmail } from "@/lib/sendEmail";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await userModel.findOne({ email });
        if (!user) {
            // Don't reveal if email exists for security
            return new Response(
                JSON.stringify({ message: "If the email exists, a reset link has been sent" }),
                { status: 200 }
            );
        }

        // Generate and save reset token
        const resetToken = user.generateResetToken();
        await user.save();

        // Send reset email
        await sendResetEmail(email, resetToken);

        return new Response(
            JSON.stringify({ message: "If the email exists, a reset link has been sent" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return new Response(
            JSON.stringify({ error: "Something went wrong" }),
            { status: 500 }
        );
    }
}