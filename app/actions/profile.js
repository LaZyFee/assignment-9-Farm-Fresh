"use server"

import { auth } from "@/auth";
import userModel from "@/model/user-model";
import { dbConnect } from "@/service/mongo";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function updateProfile(formData) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();

        const firstName = formData.get("firstName")?.toString().trim();
        const lastName = formData.get("lastName")?.toString().trim();
        const phone = formData.get("phone")?.toString().trim();
        const address = formData.get("address")?.toString().trim();
        const bio = formData.get("bio")?.toString().trim();
        const userType = formData.get("userType")?.toString().trim();
        const profilePictureFile = formData.get("profilePicture");

        // Validate required fields
        if (!firstName || !lastName || !phone || !address) {
            return { success: false, error: "All required fields must be filled" };
        }

        // Validate userType
        if (!userType || !["customer", "farmer"].includes(userType)) {
            return { success: false, error: "Invalid user type" };
        }

        // Validate phone number (basic validation)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return { success: false, error: "Please enter a valid phone number" };
        }

        // Validate bio length
        if (bio && bio.length > 250) {
            return { success: false, error: "Bio must be less than 250 characters" };
        }

        const updateData = {
            firstName,
            lastName,
            phone,
            address,
            bio: bio || "",
            userType,
        };

        // Get current user
        const currentUser = await userModel.findById(session.user.id);
        if (!currentUser) {
            return { success: false, error: "User not found" };
        }

        // Handle farmer-specific fields
        if (userType === "farmer") {
            const farmName = formData.get("farmName")?.toString().trim();
            const specialization = formData.get("specialization")?.toString().trim();
            const farmSize = formData.get("farmSize")?.toString().trim();
            const farmSizeUnit = formData.get("farmSizeUnit")?.toString().trim();

            updateData.farmName = farmName || "";
            updateData.specialization = specialization || "";

            if (farmSize && farmSizeUnit) {
                const farmSizeValue = parseFloat(farmSize);
                if (isNaN(farmSizeValue) || farmSizeValue < 0) {
                    return { success: false, error: "Please enter a valid farm size" };
                }

                updateData.farmSize = {
                    value: farmSizeValue,
                    unit: farmSizeUnit
                };
            } else {
                // Clear farm size if not provided
                updateData.farmSize = {
                    value: 0,
                    unit: "acres"
                };
            }
        }

        // Handle profile picture upload
        if (profilePictureFile && profilePictureFile.size > 0) {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedTypes.includes(profilePictureFile.type)) {
                return { success: false, error: "Only PNG, JPG, and GIF files are allowed" };
            }

            // Validate file size (2MB max)
            if (profilePictureFile.size > 2 * 1024 * 1024) {
                return { success: false, error: "Profile picture must be less than 2MB" };
            }

            try {
                // Create unique filename
                const bytes = await profilePictureFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileExtension = profilePictureFile.name.split('.').pop();
                const fileName = `profile-${session.user.id}-${Date.now()}.${fileExtension}`;

                // Save to public/uploads directory
                const uploadsDir = join(process.cwd(), "public", "uploads");
                const filePath = join(uploadsDir, fileName);

                await writeFile(filePath, buffer);

                // Delete old profile picture if it exists and is not a default/external image
                if (currentUser.profilePicture &&
                    currentUser.profilePicture.startsWith('/uploads/') &&
                    !currentUser.profilePicture.includes('http')) {
                    try {
                        const oldFilePath = join(process.cwd(), "public", currentUser.profilePicture);
                        await unlink(oldFilePath);
                    } catch (unlinkError) {
                        console.log("Could not delete old profile picture:", unlinkError);
                    }
                }

                updateData.profilePicture = `/uploads/${fileName}`;
            } catch (fileError) {
                console.error("File upload error:", fileError);
                return { success: false, error: "Failed to upload profile picture" };
            }
        }

        // Check if user is switching from farmer to customer
        const switchingToCustomer = currentUser.userType === "farmer" && userType === "customer";

        let updatedUser;

        if (switchingToCustomer) {
            // Use $unset to remove farmer-specific fields when switching to customer
            updatedUser = await userModel.findByIdAndUpdate(
                session.user.id,
                {
                    $set: updateData,
                    $unset: {
                        farmName: "",
                        specialization: "",
                        farmSize: ""
                    }
                },
                { new: true, runValidators: true }
            );
        } else {
            // Normal update
            updatedUser = await userModel.findByIdAndUpdate(
                session.user.id,
                updateData,
                { new: true, runValidators: true }
            );
        }

        if (!updatedUser) {
            return { success: false, error: "Failed to update profile" };
        }

        // Return success message with role change notification if applicable
        const roleChanged = currentUser.userType !== userType;
        const message = roleChanged
            ? `Profile updated successfully! Your account type has been changed to ${userType}.`
            : "Profile updated successfully";

        return {
            success: true,
            message,
            roleChanged,
            newUserType: userType
        };

    } catch (error) {
        console.error("Update profile error:", error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return { success: false, error: errors.join(', ') };
        }

        return { success: false, error: "Internal server error" };
    }
}

export async function deleteProfile() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();

        // Get current user
        const currentUser = await userModel.findById(session.user.id);
        if (!currentUser) {
            return { success: false, error: "User not found" };
        }

        // Delete profile picture if it exists and is stored locally
        if (currentUser.profilePicture &&
            currentUser.profilePicture.startsWith('/uploads/') &&
            !currentUser.profilePicture.includes('http')) {
            try {
                const filePath = join(process.cwd(), "public", currentUser.profilePicture);
                await unlink(filePath);
            } catch (unlinkError) {
                console.log("Could not delete profile picture:", unlinkError);
            }
        }

        // Delete user from database
        await userModel.findByIdAndDelete(session.user.id);

        return { success: true, message: "Profile deleted successfully" };

    } catch (error) {
        console.error("Delete profile error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function changePassword(formData) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const currentPassword = formData.get("currentPassword")?.toString();
        const newPassword = formData.get("newPassword")?.toString();
        const confirmPassword = formData.get("confirmPassword")?.toString();

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return { success: false, error: "All fields are required" };
        }

        // Validate new password
        if (newPassword.length < 6) {
            return { success: false, error: "New password must be at least 6 characters long" };
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return { success: false, error: "New passwords do not match" };
        }

        await dbConnect();

        // Get current user
        const currentUser = await userModel.findById(session.user.id);
        if (!currentUser) {
            return { success: false, error: "User not found" };
        }

        // Check if user has a password (not OAuth-only user)
        if (!currentUser.password) {
            return { success: false, error: "Cannot change password for social login accounts" };
        }

        // Verify current password
        const isCurrentPasswordValid = await currentUser.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Update password
        currentUser.password = newPassword;
        await currentUser.save();

        return { success: true, message: "Password changed successfully" };

    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Internal server error" };
    }
}