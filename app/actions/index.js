"use server"

import { signIn } from "@/auth";
import userModel from "@/model/user-model";
import { dbConnect } from "@/service/mongo";
import fs from "fs/promises";
import path from "path";

export async function credentialLogin(formData) {
    try {
        // console.log("Attempting credential login with:", {
        //     email: formData.get("email"),
        //     password: formData.get("password"),
        //     remember: formData.get("remember"),
        // });
        const response = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });
        // console.log("SignIn response:", response);
        return response;
    } catch (error) {
        console.error("Credential login error:", error);
        throw new Error(error.message || "Login failed");
    }
}

export async function doSocialLogin(formData) {
    const action = formData.get("action");
    // console.log("Attempting social login with action:", action);

    await signIn(action, { redirectTo: "/" });
}

// Updated registration action
export async function registerUser(formData) {
    await dbConnect();
    try {
        // Extract fields from FormData
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");
        const phone = formData.get("phone");
        const address = formData.get("address");
        const bio = formData.get("bio") || "";
        const userType = formData.get("userType");
        const farmName = formData.get("farmName");
        const specialization = formData.get("specialization");
        const farmSize = formData.get("farmSize");
        const farmSizeUnit = formData.get("farmSizeUnit");
        const profilePicture = formData.get("profilePicture");

        // Validation
        if (!firstName || !lastName || !email || !password || !phone || !address || !userType) {
            throw new Error("All required fields must be filled");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Prepare user data
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            address,
            bio,
            userType,
        };

        // Add farmer-specific fields if userType is 'farmer'
        if (userType === "farmer") {
            if (!farmName || !specialization) {
                throw new Error("Farm name and specialization are required for farmers");
            }
            userData.farmName = farmName;
            userData.specialization = specialization;
            if (farmSize && farmSizeUnit) {
                userData.farmSize = { value: parseFloat(farmSize), unit: farmSizeUnit };
            }
        }

        // Handle profile picture
        if (profilePicture && profilePicture.size > 0) {
            // Validate file type
            const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
            if (!allowedTypes.includes(profilePicture.type)) {
                throw new Error("Only PNG, JPG, and GIF files are allowed");
            }

            // Validate file size (2MB limit)
            if (profilePicture.size > 2 * 1024 * 1024) {
                throw new Error("Profile picture must be less than 2MB");
            }

            // Generate unique filename
            const fileName = `${Date.now()}_${profilePicture.name}`;
            const filePath = path.join(process.cwd(), "public/uploads", fileName);

            // Ensure uploads directory exists
            await fs.mkdir(path.join(process.cwd(), "public/uploads"), { recursive: true });

            // Write file to disk
            const fileBuffer = Buffer.from(await profilePicture.arrayBuffer());
            await fs.writeFile(filePath, fileBuffer);

            // Store file path in user data
            userData.profilePicture = `/uploads/${fileName}`;
        }

        // Create new user
        const user = new userModel(userData);
        await user.save();

        // Sign in the user after registration
        const response = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: true, message: "Registration successful", response };
    } catch (error) {
        throw new Error(error.message || "Registration failed");
    }
}
