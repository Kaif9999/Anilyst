import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
});

export const config = {
  matcher: [
    
    "/api/user/:path*",
    "/api/auth/:path*",
  ]
}; 