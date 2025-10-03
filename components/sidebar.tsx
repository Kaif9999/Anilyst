"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  Brain,
  Upload,
  User,
  Menu,
  X,
  CheckCircle,
  Trash2,
  PanelRightClose,
  History,
  MessageSquare,
} from 'lucide-react';
import { useFileStore } from '@/store/file-store';
import UploadModal from './upload-modal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  lastMessage: string;
}

const mockChatHistory: ChatHistoryItem[] = [
  {
    id: '1',
    title: 'Stock Analysis Q3 2024',
    timestamp: '2024-10-02T10:30:00Z',
    messageCount: 12,
    lastMessage: 'Generated quarterly performance report with key insights...'
  },
  {
    id: '2',
    title: 'Sales Data Deep Dive',
    timestamp: '2024-10-01T15:45:00Z',
    messageCount: 8,
    lastMessage: 'Identified correlation between marketing spend and sales...'
  },
  {
    id: '3',
    title: 'Customer Segmentation',
    timestamp: '2024-09-30T09:15:00Z',
    messageCount: 15,
    lastMessage: 'Created customer personas based on purchasing behavior...'
  },
  {
    id: '4',
    title: 'Revenue Forecasting',
    timestamp: '2024-09-29T14:20:00Z',
    messageCount: 6,
    lastMessage: 'Projected 23% growth for next quarter based on trends...'
  },
  {
    id: '5',
    title: 'Market Trend Analysis',
    timestamp: '2024-09-28T11:00:00Z',
    messageCount: 10,
    lastMessage: 'Analyzed market volatility and risk factors...'
  }
];

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(mockChatHistory);
  const [sessionFetched, setSessionFetched] = useState(false);
  

  const { currentFile, hasData, setUploadModalOpen, clearData } = useFileStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const isOAuthCallback = searchParams.get('code') || searchParams.get('state');
      
      console.log('📊 Sidebar - OAuth Callback Check:', {
        isOAuthCallback,
        status,
        hasSession: !!session,
        sessionFetched
      });

      if (status === 'authenticated' && !sessionFetched) {
        await update();
        setSessionFetched(true);

      }
    };

    handleOAuthCallback();
  }, [status, session, searchParams, update, sessionFetched]);

  // Monitor session data changes
  useEffect(() => {

    
    if (status === 'authenticated' && session?.user) {
     
      
      const hasCompleteData = session.user.name && session.user.email && session.user.image;
      
      if (!hasCompleteData && !sessionFetched) {
        console.log('⚠️ User data incomplete, forcing session update...');
        update().then(() => {
          setSessionFetched(true);
          console.log('✅ Session update completed');
        });
      }
    }
  }, [status, session, sessionFetched, update]);

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

  const handleUploadClick = () => {
    setUploadModalOpen(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleRemoveData = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove the uploaded data?')) {
      clearData();
    }
  };

  const handleChatHistoryClick = (chatId: string) => {
    console.log('Loading chat:', chatId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getUserData = () => {
    if (status === 'loading') {
      return {
        name: 'Loading...',
        email: 'Loading...',
        image: null
      };
    }

    if (status === 'unauthenticated' || !session?.user) {
      return {
        name: 'Guest',
        email: 'Not signed in',
        image: null
      };
    }

    return {
      name: session.user.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || 'No email',
      image: session.user.image || null
    };
  };

  const userData = getUserData();
  
  return (
    <>
      {/* Mobile Toggle Button */}
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
            ? isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full' 
            : 'translate-x-0'
        } fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out min-h-screen flex flex-col text-white shadow-2xl overflow-hidden ${
          isCollapsed && !isMobile ? 'w-16 bg-black/80 backdrop-blur-md' : 'w-[260px] bg-black/80 backdrop-blur-xl'
        }`}
      >
        {/* Collapsed View - Icon Only */}
        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center h-full py-4 space-y-4">
            

          
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Upload Icon */}
            <button
              onClick={handleUploadClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Upload Data"
            >
              {hasData() ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-white" />
              )}
              {hasData() && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/40"></div>
              )}
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-110 transition-transform duration-300">
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
            </div>
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
                <PanelRightClose className="w-4 h-4 text-gray-400 group-hover:text-white" />
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
            <div className="flex items-center px-6 py-5 border-b border-white/10 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
                Anilyst
              </span>
            </div>
            
            {/* Chat History Section */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
              {/* History Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Chat History</span>
                </div>
              </div>
              
              {/* History List */}
              <div className="flex-1 overflow-y-auto px-2 py-2">
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleChatHistoryClick(chat.id)}
                      className="w-full text-left p-3 rounded-lg transition-all duration-200 group hover:bg-white/5 border border-transparent hover:border-white/10 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate pr-2 group-hover:text-blue-300 transition-colors">
                            {truncateText(chat.title, 20)}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatRelativeTime(chat.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2 group-hover:text-gray-300 transition-colors">
                          {truncateText(chat.lastMessage, 60)}
                        </p>
                        
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {chat.messageCount} messages
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* New Chat Button */}
                  <button
                    onClick={() => {
                      console.log('Starting new chat');
                      handleItemClick();
                    }}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-white/20 hover:border-white/30 transition-all duration-200 group mt-2"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-400 group-hover:text-gray-300">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">New Chat</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bottom section */}
            <div className="px-4 pb-4 space-y-3 relative z-10 border-t border-white/10 pt-4">
              {/* Upload Data button */}
              <button
                onClick={handleUploadClick}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-3 text-center transition-all duration-300 group backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center relative z-10 justify-between">
                  <div className="flex items-center">
                    {hasData() ? (
                      <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300 mr-2" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all duration-300 group-hover:scale-110 mr-2" />
                    )}
                    
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">
                        {hasData() ? 'Data Loaded' : 'Upload Data'}
                      </div>
                      {hasData() && currentFile && (
                        <div className="text-xs text-green-400 truncate max-w-[120px]">
                          {currentFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hasData() && (
                    <button
                      onClick={handleRemoveData}
                      className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 group/remove"
                      title="Remove uploaded data"
                    >
                      <Trash2 className="w-3 h-3 text-red-400 group-hover/remove:text-red-300" />
                    </button>
                  )}
                </div>
              </button>
              
              {/* User Profile */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden cursor-pointer">
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
                
                <div className="flex-1 relative z-10 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {truncateText(userData.name, 16)}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {truncateText(userData.email, 20)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Upload Modal */}
      <UploadModal />
    </>
  );
}

function SidebarWithSuspense(props: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className="fixed inset-y-0 left-0 z-40 w-16 bg-black/40 backdrop-blur-md flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-white" />
        </div>
      </aside>
    }>
      <Sidebar {...props} />
    </Suspense>
  );
}

export default SidebarWithSuspense;