"use client";

import Sidebar from "@/components/sidebar";
import AgentChatSidebar from "@/components/agent-chat-sidebar";
import { ChatSessionsProvider } from "@/contexts/ChatSessionsContext";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";

import { useState, createContext, useContext } from 'react';

const inter = Inter({ subsets: ["latin"] });

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
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAgentPage = pathname?.startsWith("/dashboard/agent");

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const SidebarComponent = isAgentPage ? AgentChatSidebar : Sidebar;

  const content = (
    <div className="flex">
      <SidebarComponent
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main className={`flex-1 min-h-screen transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-16' : 'md:ml-[260px]'
      }`}>
        <div className="w-full h-full ">
          {children}
        </div>
      </main>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      <div className={`min-h-screen ${inter.className}`}>
        {isAgentPage ? (
          <ChatSessionsProvider>
            {content}
          </ChatSessionsProvider>
        ) : (
          content
        )}
      </div>
    </SidebarContext.Provider>
  );
}