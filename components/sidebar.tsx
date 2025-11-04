"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  User,
  Menu,
  X,
  Trash2,
  MessageSquare,
  FileText,
  MoreVertical,
  Plus,
  PanelRightOpen,
} from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import UserProfileModal from './user-profile-modal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const {
    sessions,
    currentSession,
    createSession,
    loadSession,
    deleteSession,
    isLoading,
    refreshSessions,
  } = useChatSessions();

  // ✅ Listen for title update events from chat interface
  useEffect(() => {
    const handleTitleUpdate = (event: CustomEvent) => {
      console.log('🔔 Received title update event:', event.detail);
      // Refresh sessions to get the updated title
      refreshSessions();
    };

    window.addEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);
    return () => {
      window.removeEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);
    };
  }, [refreshSessions]);

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

  const handleNewChat = async () => {
    const newSession = await createSession();
    if (newSession) {
      // ✅ Navigate to new session with clean state
      router.push(`/dashboard/agent?session=${newSession.id}`);
      
      // ✅ Force refresh to ensure clean state
      router.refresh();
    }
    handleItemClick();
  };

  const handleChatClick = async (sessionId: string) => {
    // ✅ Load the session and navigate
    await loadSession(sessionId);
    router.push(`/dashboard/agent?session=${sessionId}`);
    
    // ✅ Force refresh to load messages
    router.refresh();
    
    handleItemClick();
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(sessionId);
    }
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
        } fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out min-h-screen flex flex-col text-white overflow-hidden ${
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
            <div className="flex items-center px-4 py-4 border-b border-white/10 relative z-10">
              <div className="w-8 h-8 flex items-center justify-center mr-3 ">
                <Image src="/anilyst_logo.svg" alt="Anilyst Logo" width={25} height={25} />
              </div>
              
              <span className="text-xl font-semibold text-white bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
                Anilyst
              </span>
            </div>
            
            {/* New Chat Button */}
            <div className="px-4 py-3 border-b border-white/10">
              <Button
                onClick={handleNewChat}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg "
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Chat</span>
              </Button>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
              {/* History List */}
              <div className="flex-1 overflow-y-auto px-2 py-2">
                <div className="space-y-1">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No chats yet</p>
                      <p className="text-xs text-gray-600 mt-1">Start a new conversation</p>
                    </div>
                  ) : (
                    sessions.map((chatSession) => (
                      <div
                        key={chatSession.id}
                        onClick={() => handleChatClick(chatSession.id)}
                        className={`group relative p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          currentSession?.id === chatSession.id
                            ? 'bg-white/10'
                            : 'hover:bg-white/5 hover:rounded-xl bg-black/10'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {chatSession.hasData ? (
                              <FileText className="w-4 h-4 text-green-400" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-medium text-white truncate">
                                {truncateText(chatSession.title, 25)}
                              </h4>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-2xl transition-all"
                                  >
                                    <MoreVertical className="w-3 h-3 text-gray-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                                  <DropdownMenuItem
                                    onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleDeleteChat(e, chatSession.id)}
                                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {chatSession.lastMessage && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {truncateText(chatSession.lastMessage, 35)}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-600">
                                {formatDate(chatSession.updatedAt)}
                              </span>
                              {chatSession.hasData && chatSession.dataFileName && (
                                <span className="text-xs text-green-500/70 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {truncateText(chatSession.dataFileName, 15)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
         
            <div className="px-4 pb-4 space-y-3 relative z-10 border-t border-white/10 pt-4">
         
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
                
                <MoreVertical className="w-4 h-4 text-gray-400 relative z-10" />
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