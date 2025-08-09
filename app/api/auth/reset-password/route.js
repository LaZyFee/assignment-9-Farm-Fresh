import { dbConnect } from "@/service/mongo";
import userModel from "@/model/user-model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return new Response(
                JSON.stringify({ error: "Token and password are required" }),
                { status: 400 }
            );
        }

        await dbConnect();

        // Hash the incoming raw token to compare
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching resetToken and check expiry
        const user = await userModel.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return new Response(
                JSON.stringify({ error: "Invalid or expired token" }),
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return new Response(
            JSON.stringify({ message: "Password reset successful" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return new Response(
            JSON.stringify({ error: "Something went wrong" }),
            { status: 500 }
        );
    }
}
