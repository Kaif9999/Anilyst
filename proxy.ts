import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/csrf";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

const CSRF_PROTECTED_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const CSRF_EXCLUDED_PATHS = [
  "/api/auth",
  "/api/webhook",
  "/api/csrf",
  "/api/health",
];

function needsCsrfCheck(pathname: string, method: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  if (!CSRF_PROTECTED_METHODS.includes(method)) return false;
  return !CSRF_EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

function proxy(req: NextRequest) {
  // CSRF check for mutating API routes
  if (needsCsrfCheck(req.nextUrl.pathname, req.method)) {
    const headerToken = req.headers.get(CSRF_HEADER_NAME);
    const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
    if (!validateRequest(headerToken, cookieToken)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }
  }

  // Rate limit for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const { success, remaining, resetIn } = checkRateLimit(
      req.nextUrl.pathname,
      req
    );
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export default withAuth(proxy, {
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
});

export const config = {
  matcher: [
    "/api/usage",
    "/api/analyze",
    "/api/query",
    "/api/visualize",
    "/api/upload",
    "/api/chat-sessions/:path*",
    "/api/vector/:path*",
    "/api/create-payment-link",
    "/api/user/:path*",
    "/api/auth/:path*",
    "/dashboard/:path*",
    "/visualization/:path*",
    "/analysis/:path*",
  ],
}; 