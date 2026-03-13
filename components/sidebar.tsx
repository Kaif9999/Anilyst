"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  User,
  Menu,
  X,
  MessageSquare,
  FileText,
  Plus,
  PanelRightOpen,
  Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfileModal from './user-profile-modal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleItemClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleNewChat = () => {
    router.push("/dashboard/agent");
    router.refresh();
    handleItemClick();
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getUserData = () => {
    if (status === 'loading') {
      return { name: 'Loading...', email: 'Loading...', image: null };
    }

    if (status === 'unauthenticated' || !session?.user) {
      return { name: 'Guest', email: 'Not signed in', image: null };
    }

    return {
      name: session.user.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || 'No email',
      image: session.user.image || null,
    };
  };

  const userData = getUserData();
  
  return (
    <>
      {isMobile && (
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed z-30 top-4 left-4 bg-black/40 backdrop-blur-lg hover:bg-black/60 rounded-lg p-2 shadow-xl transition-all duration-300 border border-white/10 hover:border-white/20"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}
      
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${
          isMobile 
            ? isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full' 
            : 'translate-x-0'
        } fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out min-h-screen flex flex-col text-white overflow-hidden border-r border-white/10 ${
          isCollapsed && !isMobile ? 'w-16 bg-[#111314] ' : 'w-[260px] bg-[#111314] '
        }`}
      >
        {/* Collapsed View */}
        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center h-full py-4 space-y-4 relative">
            <div className="w-10 h-10 flex items-center absolute justify-center top-7">
              <Image src="/anilyst_logo.svg" alt="Anilyst Logo" width={25} height={25}/>
            </div>

            <div className="flex-1"></div>

            <button
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title="View Profile"
            >
              {userData.image ? (
                <Image
                  src={userData.image}
                  alt={userData.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Expanded View - Full Content */}
        {!isCollapsed && (
          <>
            {/* Desktop Collapse Button */}
            {!isMobile && (
              <button
                onClick={onToggle}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors z-50 group"
                title="Collapse Sidebar"
              >
                <PanelRightOpen className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors z-50"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
            
            {/* Top section - Logo */}
            <div className="flex items-center justify-center px-4 py-4 border-b border-white/10 relative z-10">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Image src="/anilyst_logo.svg" alt="Anilyst Logo" width={25} height={25} />
              </div>
              
              <span className="text-xl font-semibold text-white bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
                Anilyst
              </span>
            </div>
            
            {/* Go to AI Agent / New Chat */}
            <div className="px-4 py-3 border-b border-white/10">
              <Button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg "
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Open AI Agent</span>
              </Button>
            </div>

            {/* Placeholder section to fill vertical space */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 py-4">
                <div className="text-sm text-gray-500 space-y-2">
                  <p>Use the AI Agent to analyze your data and chats.</p>
                  <p className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span>Open the agent from here, or upload data on the relevant pages.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Uploaded files and analysis live in the agent view.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-3 relative z-10 border-t border-white/10 pt-4">
              <button
                onClick={() => { router.push("/dashboard/integrations"); handleItemClick(); }}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <Plug className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="text-sm font-medium text-white">Integrations</span>
              </button>
              <button
                onClick={handleProfileClick}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 flex items-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 shadow-lg shadow-blue-500/20 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {userData.image ? (
                    <Image
                      src={userData.image}
                      alt={userData.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 relative z-10 min-w-0 text-left">
                  <div className="text-sm font-medium text-white truncate">
                    {truncateText(userData.name, 16)}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {truncateText(userData.email, 20)}
                  </div>
                </div>
          
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}

function SidebarWithSuspense(props: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className="fixed inset-y-0 left-0 z-40 w-16 flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-brflex items-center justify-center ">
        </div>
      </aside>
    }>
      <Sidebar {...props} />
    </Suspense>
  );
}

export default SidebarWithSuspense;