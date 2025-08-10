"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddProductForm from "@/components/AddProductForm";

export default function AddProductPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        if (session.user?.userType !== "farmer") {
            router.push("/");
            return;
        }
    }, [session, status, router]);

    // Show loading while checking session
    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (!session || session.user?.userType !== "farmer") {
        return null;
    }

    return <AddProductForm />;
}