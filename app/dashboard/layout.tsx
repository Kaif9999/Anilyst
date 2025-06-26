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
    <div className={`min-h-screen bg-gray-900 ${inter.className}`}>
      <div className="flex">
        <Sidebar />
        
        {/* Main content with matching background */}
        <main className="flex-1 md:ml-72 min-h-screen bg-gray-900">
          <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
            <PageTitle />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
