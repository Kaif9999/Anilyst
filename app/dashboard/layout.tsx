"use client";

import Sidebar from "@/components/sidebar";
import PageTitle from "@/components/page-title";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-black ${inter.className}`}>
      <div className="flex">
        <Sidebar />
        
        {/* Remove left padding from main content when it touches the sidebar */}
        <main className="flex-1 md:ml-64 min-h-screen bg-gray-900">
          
            {children}
        
        </main>
      </div>
    </div>
  );
}
