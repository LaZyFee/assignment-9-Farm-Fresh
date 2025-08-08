"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegistrationForm";

export default function RegisterModal() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-auto">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-4xl shadow-xl relative my-10 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                >
                    ×
                </button>
                <RegisterForm isModal={true} />
            </div>
        </div>
    );
}
