"use client";

import Sidebar from "@/components/sidebar";

import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-black/70 ${inter.className}`}>
      <div className="flex">
        <Sidebar />
        
        {/* Main content with matching black background */}
        <main className="flex-1 md:ml-72 min-h-screen bg-black/70">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
