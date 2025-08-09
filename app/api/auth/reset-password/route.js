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
        // console.log("User found with reset token:", !!user);


        if (!user) {
            return new Response(
                JSON.stringify({ error: "Invalid or expired token" }),
                { status: 400 }
            );
        }



        // Update user's password and clear reset token fields
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        try {
            await user.save();
            // console.log("User password updated and reset token cleared");
        } catch (err) {
            console.error("Error saving user:", err);
            throw err;
        }

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
