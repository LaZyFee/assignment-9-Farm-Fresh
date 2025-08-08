import nodemailer from "nodemailer";

export async function POST(req) {
    const { email } = await req.json();

    const token = "some-generated-token";

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    try {
        await transporter.sendMail({
            to: email,
            subject: "Reset your password",
            html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
        });

        return Response.json({ message: "Reset link sent to your email." });
    } catch (error) {
        return Response.json({ error: "Failed to send email." }, { status: 500 });
    }
}
