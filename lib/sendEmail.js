import nodemailer from "nodemailer";

export async function sendResetEmail(email, token) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
        },
    });

    const mailOptions = {
        from: "no-reply@farmfresh.com",
        to: email,
        subject: "Password Reset Request",
        html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you didn't request this, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}