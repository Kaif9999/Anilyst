import { withAuth } from "next-auth/middleware";

export default withAuth({
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
    // "/main/:path*",
    "/api/user/:path*",
    "/api/auth/:path*",
  ]
}; 