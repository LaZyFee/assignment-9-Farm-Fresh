import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 250,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    userType: {
        type: String,
        enum: ['customer', 'farmer'],
        required: true,
        default: 'customer',
    },
    // Farmer-specific fields
    farmName: {
        type: String,
        required: function () {
            return this.userType === 'farmer';
        },
    },
    specialization: {
        type: String,
        enum: ['vegetables', 'fruits', 'grains', 'dairy', 'mixed'],
        required: function () {
            return this.userType === 'farmer';
        },
    },
    farmSize: {
        value: {
            type: Number,
            min: 0,
        },
        unit: {
            type: String,
            enum: ['acres', 'hectares', 'sq_ft', 'sq_m'],
        },
    },
    // OAuth fields
    googleId: {
        type: String,
        sparse: true,
    },
    emailVerified: {
        type: Date,
        default: null,
    },
    // Password reset
    resetToken: String,
    resetTokenExpiry: Date,
}, {
    timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate reset token
UserSchema.methods.generateResetToken = function () {
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    this.resetToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);