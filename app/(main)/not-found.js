import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
            <p className="mb-4">The page you are looking for does not exist.</p>
            <Link href="/" className="text-blue-500 hover:underline">
                Go back home
            </Link>
        </div>
    );
}
