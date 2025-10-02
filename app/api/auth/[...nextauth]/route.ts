import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("🔐 SignIn Callback - Provider:", account?.provider);
      
      if (account?.provider === "google" && profile) {
        try {
          if (!profile?.email) {
            console.error("❌ No email provided by Google");
            return false;
          }

          const googleProfile = profile as any;
          
          const existingUser = await prisma.user.findUnique({
            where: { email: googleProfile.email },
            include: { accounts: true },
          });

          if (existingUser) {
            console.log("👤 Updating existing user with Google data...");
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: googleProfile.name,
                image: googleProfile.picture,
              },
            });

            const hasGoogleAccount = existingUser.accounts.some(
              (acc) => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
            );

            if (!hasGoogleAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type || "oauth",
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }
            console.log("✅ User updated successfully");
            return true;
          }

          console.log("👤 Creating new user with Google data...");
          const newUser = await prisma.user.create({
            data: {
              email: googleProfile.email,
              name: googleProfile.name,
              image: googleProfile.picture,
              emailVerified: new Date(),
              subscriptionType: "FREE",
              usageLimit: {
                create: {
                  visualizations: 0,
                  analyses: 0,
                  lastResetDate: new Date(),
                },
              },
              accounts: {
                create: {
                  type: account.type || "oauth",
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              },
            },
          });
          console.log("✅ New user created successfully:", newUser.id);

          return true;
        } catch (error) {
          console.error("❌ Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, profile, account, trigger }) {
      console.log("🎫 JWT Callback - Trigger:", trigger, "User:", user ? "present" : "absent", "Profile:", profile ? "present" : "absent");
      
      // Initial sign in - user object is present
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.name = user.name || "";
        token.email = user.email || "";
        token.picture = user.image || "";
        
        return token;
      }
      
      // For Google OAuth - profile is present on first sign in
      if (profile && account?.provider === "google") {
        const googleProfile = profile as any;
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: googleProfile.email },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.id = dbUser.id;
            token.name = dbUser.name || googleProfile.name;
            token.email = dbUser.email || googleProfile.email;
            token.picture = dbUser.image || googleProfile.picture;
            console.log("✅ JWT from Google with DB user:", { 
              sub: token.sub,
              id: dbUser.id,
              name: token.name, 
              email: token.email, 
              picture: token.picture 
            });
            return token;
          } else {
            console.error("❌ User not found in database after Google sign in");
          }
        } catch (error) {
          console.error("❌ Error fetching user in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      
      if (session?.user && token) {
        session.user.id = (token.sub || token.id) as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        
       
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback - URL:", url, "BaseURL:", baseUrl);
      
      // If url is relative, prefix with baseUrl
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log("🔄 Converted relative URL to:", fullUrl);
        return fullUrl;
      }
      
      // Allow callback to the same origin
      if (url.startsWith(baseUrl)) {
        console.log("🔄 Allowing same-origin redirect:", url);
        return url;
      }
      
      // Fallback to base URL
      console.log("🔄 Fallback redirect to baseUrl");
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  events: {
    async signIn({ user }) {
      console.log("🎉 Sign in event - User:", { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        image: user.image 
      });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };