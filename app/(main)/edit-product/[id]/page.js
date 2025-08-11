"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EditProductForm from "@/components/EditProductForm";

export default function EditProductPage({ params }) {
    const { id } = params;
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

    if (status === "loading") return <div>Loading...</div>;
    if (!session || session.user?.userType !== "farmer") return null;

    return <EditProductForm productId={id} />;
}