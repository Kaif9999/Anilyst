"use client";

import Sidebar from "@/components/sidebar";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import { useState, createContext, useContext } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Create context for sidebar state
const SidebarContext = createContext<{
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}>({
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      <div className={`min-h-screen bg-black/70 ${inter.className}`}>
        <div className="flex">
          <Sidebar 
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 min-h-screen bg-black/70 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:ml-16' : 'md:ml-[246px]'
          }`}>
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}