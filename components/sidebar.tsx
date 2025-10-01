"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  Brain,
  Upload,
  Crown,
  User,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  BarChart3,
  TrendingUp,
  FileText,
  Bot,
  Trash2,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { useFileStore } from '@/store/file-store';
import UploadModal from './upload-modal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get file store state
  const { currentFile, hasData, setUploadModalOpen, clearData } = useFileStore();

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
  
  // Define navigation items for consistent reference
  const navItems = [
    { name: 'Anilyst Agent', path: '/dashboard/agent', icon: Bot, special: true }
  ];
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleItemClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    setUploadModalOpen(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle remove data
  const handleRemoveData = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove the uploaded data?')) {
      clearData();
    }
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
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
        } fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out min-h-screen flex flex-col bg-black/80 backdrop-blur-xl text-white shadow-2xl overflow-hidden ${
          isCollapsed && !isMobile ? 'w-17' : 'w-65'
        }`}
      >
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors z-50 group"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelRightClose className="w-5 h-5 text-gray-400 group-hover:text-white" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-gray-400 group-hover:text-white" />
            )}
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
          {(!isCollapsed || isMobile) && (
            <span className="text-lg font-semibold text-white bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
              Anilyst
            </span>
          )}
        </div>
        
        {/* Main navigation */}
        <nav className="flex-1 px-4 py-4 relative z-10">
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.path}>
                  <div 
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 group cursor-pointer text-sm relative overflow-hidden ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/20 border border-white/10'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent'
                    } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                    onClick={handleItemClick}
                    title={isCollapsed && !isMobile ? item.name : ''}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    
                    {item.special ? (
                      <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center shadow-md shadow-green-500/20 relative z-10">
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <IconComponent className={`w-5 h-5 relative z-10 ${
                        isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      } ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                    )}
                    
                    {(!isCollapsed || isMobile) && (
                      <span className="font-medium relative z-10">{item.name}</span>
                    )}
                    
                    {/* Active indicator */}
                    {isActive(item.path) && (
                      <div className="absolute right-2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Bottom section */}
        <div className="px-4 pb-4 space-y-3 relative z-10">
          {/* Upload Data button */}
          <button
            onClick={handleUploadClick}
            className={`w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-3 text-center transition-all duration-300 group backdrop-blur-sm relative overflow-hidden ${
              isCollapsed && !isMobile ? 'px-2' : ''
            }`}
            title={isCollapsed && !isMobile ? (hasData() ? 'Data Loaded' : 'Upload Data') : ''}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className={`flex items-center relative z-10 ${
              isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
            }`}>
              <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
                {hasData() ? (
                  <CheckCircle className={`w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300 ${
                    isCollapsed && !isMobile ? '' : 'mr-2'
                  }`} />
                ) : (
                  <Upload className={`w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-all duration-300 group-hover:scale-110 ${
                    isCollapsed && !isMobile ? '' : 'mr-2'
                  }`} />
                )}
                
                {(!isCollapsed || isMobile) && (
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
                )}
              </div>
              
              {/* Remove button - only show when data is loaded and sidebar is not collapsed */}
              {hasData() && (!isCollapsed || isMobile) && (
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
          <div className={`bg-white/5 border border-white/10 rounded-lg p-3 flex items-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden ${
            isCollapsed && !isMobile ? 'justify-center px-2' : ''
          }`}>
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* User Avatar */}
            <div className={`w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-blue-500/20 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
              isCollapsed && !isMobile ? '' : 'mr-3'
            }`}>
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            {/* User Info - only show when not collapsed */}
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 relative z-10 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {session?.user?.name ? truncateText(session.user.name, 16) : 'User'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {session?.user?.email ? truncateText(session.user.email, 20) : 'user@example.com'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Upload Modal */}
      <UploadModal />
    </>
  );
}
