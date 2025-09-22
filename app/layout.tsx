import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { PostHogProvider } from "./providers";
import { Toaster } from '@/components/ui/toaster';
import PostHogPageView from './PostHogPageView';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anilyst - AI-Powered Data Analysis",
  description: "Transform your data into actionable insights with AI-powered analysis and visualization.",
  keywords: ["data analysis", "AI analytics", "business intelligence", "data visualization", "machine learning"],
  openGraph: {
    title: "Anilyst - AI-Powered Data Analysis",
    description: "Transform your data into actionable insights with AI-powered analysis and visualization.",
    images: [
      {
        url: "/landing_page.jpg",
        width: 1200,
        height: 630,
        alt: "Anilyst Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anilyst - AI-Powered Data Analysis",
    description: "Transform your data into actionable insights with AI-powered analysis and visualization.",
    images: "/landing_page.jpg"
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <PostHogProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <PostHogPageView />
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
