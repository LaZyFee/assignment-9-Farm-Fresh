"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const validatePassword = (pwd) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasLowerCase = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        return (
            pwd.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumber
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!validatePassword(password)) {
            setError(
                "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
            );
            return;
        }

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, password }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Password reset successful. You can now log in.");
            } else {
                setError(data.error || "Error resetting password.");
            }
        } catch {
            setError("Network error. Please try again.");
        }
    };

    return (
        <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-xl font-bold mb-4">Reset Password</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full border p-2 rounded mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-2 rounded"
                >
                    Reset Password
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </main>
    );
}