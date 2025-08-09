import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <Suspense fallback={<p>Loading...</p>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}
