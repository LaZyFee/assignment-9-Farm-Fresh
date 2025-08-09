// testEmail.js
import { sendResetEmail } from "./lib/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    // testEnv.js
    console.log(process.env.MAILTRAP_HOST);
    console.log(process.env.MAILTRAP_PORT);
    console.log(process.env.MAILTRAP_USER);
    console.log(process.env.MAILTRAP_PASS);
    try {
        await sendResetEmail("test@example.com", "test-token");
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email error:", error);
    }
}

test();