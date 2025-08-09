import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

import { DEFAULT_REDIRECT, PUBLIC_ROUTES, LOGIN, ROOT } from "@/lib/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;

    // IMPORTANT: Skip middleware for all API routes
    if (nextUrl.pathname.startsWith('/api/')) {
        // console.log("Skipping middleware for API route:", nextUrl.pathname);
        return;
    }

    // console.log({
    //     isAuthenticated,
    //     pathname: nextUrl.pathname,
    //     auth: req.auth,
    // });

    const isPublicRoute = PUBLIC_ROUTES.find((route) =>
        nextUrl.pathname.startsWith(route)
    ) || nextUrl.pathname === ROOT;

    console.log({ isPublicRoute });

    if (!isAuthenticated && !isPublicRoute) {
        // console.log("Redirecting to login from:", nextUrl.pathname);
        return Response.redirect(new URL(LOGIN, nextUrl));
    }
});

export const config = {
    // Exclude API routes from middleware matcher
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};