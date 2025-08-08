"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { FaTimes } from "react-icons/fa";

export default function LoginModal() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-auto">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-3xl shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                >
                    <FaTimes />
                </button>
                <LoginForm isModal={true} />
            </div>
        </div>
    );
}