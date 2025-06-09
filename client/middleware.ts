// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token");

//   // Define protected routes
//   const protectedRoutes = ["/dashboard", "/profile", "/settings"];

//   // Check if the request matches any protected route
//   if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
//     if (!token) {
//       // Redirect to login if no token is found
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// // Apply middleware to specific routes
// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"], // Protect all specified routes
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow requests for static files (images, favicon, etc.)
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.startsWith("/android-chrome") ||
    request.nextUrl.pathname.startsWith("/logo.png") ||
    request.nextUrl.pathname.startsWith("/apple-touch-icon") ||
    request.nextUrl.pathname.startsWith("/site.webmanifest")
  ) {
    return NextResponse.next();
  }

  // Redirect all other routes to the maintenance page
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}