import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import userModel from "./model/user-model";
import { dbConnect } from "./service/mongo";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import mongoClientPromise from "./service/mongoClinetPromise";

async function refreshAccessToken(token) {
    try {
        const url = "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            });

        const response = await fetch(url, { method: "POST" });
        const refreshedTokens = await response.json();

        if (!response.ok) throw refreshedTokens;

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

export const {
    auth,
    signIn,
    signOut,
    handlers: { GET, POST },
} = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(mongoClientPromise, { databaseName: process.env.ENVIRONMENT }),
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.error("Missing credentials");
                    throw new Error("Email and password are required");
                }

                try {
                    await dbConnect();
                    // console.log("Looking up user with email:", credentials.email);
                    const user = await userModel.findOne({ email: credentials.email }).lean();

                    if (!user) {
                        console.error("User not found for email:", credentials.email);
                        throw new Error("User not found");
                    }

                    // console.log("Comparing passwords for user:", user.email);
                    const isMatch = await bcrypt.compare(credentials.password, user.password);

                    if (!isMatch) {
                        console.error("Password mismatch for user:", user.email);
                        throw new Error("Check your password");
                    }

                    // console.log("User authenticated successfully:", user.email);
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        name: `${user.firstName} ${user.lastName}`,
                        profilePicture: user.profilePicture || null,
                        userType: user.userType,
                        phone: user.phone,
                        address: user.address,
                        bio: user.bio
                    };
                } catch (err) {
                    console.error("Authorize error:", err);
                    throw new Error(err.message || "Authentication failed");
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            try {
                await dbConnect();

                if (account.provider === "google") {
                    const existingUser = await userModel.findOne({ email: user.email });

                    if (!existingUser) {
                        await userModel.create({
                            firstName: user.name?.split(" ")[0] || "Google",
                            lastName: user.name?.split(" ")[1] || "User",
                            email: user.email,
                            googleId: account.providerAccountId,
                            userType: "customer",
                            phone: "0000000000",
                            address: "Not provided",
                            profilePicture: user.image || null,
                        });
                    }
                }

                return true;
            } catch (error) {
                console.error("Error creating Google user:", error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            // console.log("JWT Callback - Initial token:", token);
            // console.log("JWT Callback - User:", user);
            // console.log("JWT Callback - Account:", account);

            // Initial sign in
            if (account && user) {
                if (account.type === "credentials") {
                    // console.log("JWT Callback - Processing credentials login");
                    return {
                        ...token,
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePicture: user.profilePicture,
                        userType: user.userType,
                        phone: user.phone,
                        address: user.address,
                        bio: user.bio,
                        loginType: "credentials",
                    };
                }

                if (account.provider === "google") {
                    // Fetch from DB to ensure ID and image are set
                    await dbConnect();
                    const dbUser = await userModel.findOne({ email: user.email }).lean();

                    return {
                        ...token,
                        id: dbUser?._id?.toString() || user.id,
                        email: user.email,
                        name: dbUser ? `${dbUser.firstName} ${dbUser.lastName}` : user.name,
                        image: dbUser?.profilePicture || user.image,
                        accessToken: account.access_token,
                        accessTokenExpires: Date.now() + account.expires_in * 1000,
                        refreshToken: account.refresh_token,
                        loginType: "google",
                    };
                }

            }

            if (token.loginType === "credentials") {
                // console.log("JWT Callback - Returning existing credentials token");
                return token;
            }

            // Google token refresh
            if (token.loginType === "google") {
                if (Date.now() < token.accessTokenExpires) {
                    // console.log("JWT Callback - Google token still valid");
                    return token;
                }
                // console.log("JWT Callback - Refreshing Google token");
                return await refreshAccessToken(token);
            }

            return token;
        },

        async session({ session, token }) {
            // console.log("Session Callback - Token:", token);

            if (token?.error === "RefreshAccessTokenError") {
                session.error = token.error;
            }

            // different token structures
            let userData;

            if (token.loginType === "credentials") {
                if (token.user && token.user._doc) {
                    userData = token.user._doc;
                } else {
                    userData = token;
                }

                session.user = {
                    id: token.sub || token.id,
                    name: `${userData.firstName} ${userData.lastName}`,
                    email: userData.email,
                    image: userData.profilePicture || null,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    userType: userData.userType,
                    phone: userData.phone,
                    address: userData.address,
                    bio: userData.bio
                };
            } else if (token.loginType === "google") {
                // Google login structure
                session.user = {
                    id: token.id || token.sub,
                    name: token.name,
                    email: token.email,
                    image: token.image || null
                };
            } else {
                // Fallback for any other cases
                session.user = {
                    id: token.sub || token.id,
                    name: token.name,
                    email: token.email,
                    image: token.image || token.profilePicture || null
                };
            }

            if (token.accessToken) {
                session.accessToken = token.accessToken;
            }

            // console.log("Session Callback - Final session:", session);
            return session;
        }
    },
});