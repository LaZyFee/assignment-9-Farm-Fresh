import nodemailer from "nodemailer";

export async function sendResetEmail(email, token) {
    // console.log("Gmail SMTP config:", {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_APP_PASSWORD ? "****" : "MISSING",
    // });

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"FarmFresh" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request - FarmFresh",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #16a34a; margin: 0;">🌱 FarmFresh</h1>
                        <p style="color: #666; margin: 5px 0;">Local Farmer Booking</p>
                    </div>
                    
                    <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        You requested a password reset for your FarmFresh account. Click the button below to reset your password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #16a34a; word-break: break-all;">${resetUrl}</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 12px; line-height: 1.5;">
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.<br><br>
                        This link will expire in 1 hour for security reasons.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log("✅ Reset email sent to:", email);
    } catch (error) {
        console.error("❌ Gmail SMTP error:", error);
        throw new Error("Failed to send reset email");
    }
}
