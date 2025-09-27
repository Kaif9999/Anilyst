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
  Trash2
} from 'lucide-react';
import { useFileStore } from '@/store/file-store';
import UploadModal from './upload-modal';

export default function Sidebar() {
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
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Visualizations', path: '/dashboard/visualization', icon: TrendingUp },
    { name: 'Analysis', path: '/dashboard/analysis', icon: Brain },
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
    e.stopPropagation(); // Prevent triggering the upload modal
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
        } fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out min-h-screen flex flex-col bg-black/95 backdrop-blur-xl border-r border-white/10 text-white shadow-2xl overflow-hidden`}
      >
        {/* Animated background elements matching main site */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-5 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-8 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"></div>
        </div>

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
                    }`}
                    onClick={handleItemClick}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    
                    {item.special ? (
                      <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center mr-3 shadow-md shadow-green-500/20 relative z-10">
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <IconComponent className={`w-5 h-5 mr-3 relative z-10 ${
                        isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`} />
                    )}
                    <span className="font-medium relative z-10">{item.name}</span>
                    
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
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-3 text-center transition-all duration-300 group backdrop-blur-sm relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                {hasData() ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-300 mr-2 transition-all duration-300 group-hover:scale-110" />
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
              
              {/* Remove button - only show when data is loaded */}
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
          
          {/* Upgrade box */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 backdrop-blur-sm relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Link href="/pricing" className="block relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Crown className="w-4 h-4 text-yellow-400 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium text-white">Upgrade</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </div>
              <p className="text-xs text-gray-300 mb-2">
                Get unlimited access and advanced features
              </p>
              <div className="text-xs text-gray-400 mb-1">0/3 Analysis Free</div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 w-0 rounded-full transition-all duration-500 group-hover:w-2"></div>
              </div>
            </Link>
          </div>
          
          {/* User Profile */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 shadow-lg shadow-blue-500/20 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
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
            
            {/* User Info */}
            <div className="flex-1 relative z-10 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {session?.user?.name ? truncateText(session.user.name, 16) : 'User'}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {session?.user?.email ? truncateText(session.user.email, 20) : 'user@example.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Upload Modal */}
      <UploadModal />
    </>
  );
}
