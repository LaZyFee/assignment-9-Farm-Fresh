import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

import { DEFAULT_REDIRECT, PUBLIC_ROUTES, LOGIN, ROOT } from "@/lib/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;

    // Additional check for file extensions and RSC requests
    if (nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
        return;
    }

    // Skip RSC (React Server Components) requests
    if (nextUrl.searchParams.has('_rsc')) {
        return;
    }

    // Improved public route checking
    const isPublicRoute = PUBLIC_ROUTES.some((route) => {
        // Handle exact matches and dynamic routes
        if (route.includes('[id]')) {
            const routePattern = route.replace('[id]', '[^/]+');
            const regex = new RegExp(`^${routePattern}$`);
            return regex.test(nextUrl.pathname);
        }
        // Handle regular routes and their sub-paths
        return nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/');
    }) || nextUrl.pathname === ROOT;

    // console.log('Middleware Debug:', {
    //     pathname: nextUrl.pathname,
    //     isAuthenticated,
    //     isPublicRoute,
    //     matchedRoutes: PUBLIC_ROUTES.filter(route => {
    //         if (route.includes('[id]')) {
    //             const routePattern = route.replace('[id]', '[^/]+');
    //             const regex = new RegExp(`^${routePattern}$`);
    //             return regex.test(nextUrl.pathname);
    //         }
    //         return nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/');
    //     })
    // });

    // Check authentication for protected routes
    if (!isAuthenticated && !isPublicRoute) {
        console.log("Redirecting to login from:", nextUrl.pathname);
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // For sensitive routes like add-product, we'll handle protection in the component
    // This avoids the timing issue with middleware not having full session data
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - uploads (uploaded files)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|uploads|_next/static|_next/image|favicon.ico).*)",
    ],
};