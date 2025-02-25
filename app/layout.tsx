import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anilyst - Advanced Data Analysis with AI",
  description: "Transform your data analysis with Anilyst. AI-powered insights, interactive visualizations, and automated reporting. Join the waitlist for early access and 20% off.",
  keywords: ["data analysis", "AI analytics", "business intelligence", "data visualization", "machine learning"],
  openGraph: {
    title: "Anilyst - Advanced Data Analysis with AI",
    description: "Transform your data analysis with AI-powered insights. Join the waitlist for early access.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anilyst Platform Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anilyst - Advanced Data Analysis with AI",
    description: "Transform your data analysis with AI-powered insights. Join the waitlist for early access.",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
