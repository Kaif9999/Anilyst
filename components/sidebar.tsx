"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Bot
} from 'lucide-react';
import { useFileStore } from '@/store/file-store';
import UploadModal from './upload-modal';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  
  // Get file store state
  const { currentFile, hasData, setUploadModalOpen } = useFileStore();

  useEffect(() => {
    // Set active item based on current path on first load
    const matchingItem = navItems.find(item => pathname.includes(item.path));
    if (matchingItem) {
      setActiveItem(matchingItem.path);
    } else {
      // Default to dashboard if no match
      setActiveItem('/dashboard');
    }
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [pathname]);
  
  // Define navigation items for consistent reference
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Visualizations', path: '/dashboard/visualizations', icon: TrendingUp },
    { name: 'Analysis', path: '/dashboard/analysis', icon: Brain },
    // { name: 'Reports Analysis', path: '/dashboard/reports-analysis', icon: FileText },
    { name: 'Anilyst Agent', path: '/dashboard/agent', icon: Bot, special: true }
  ];
  
  // Check if a path is currently active
  const isActive = (path: string) => path === activeItem;
  
  // Handle item click - set active and close mobile
  const handleItemClick = (path: string) => {
    setActiveItem(path);
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
  
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed z-30 top-6 left-4 bg-black/80 backdrop-blur-sm hover:bg-black/90 rounded-xl p-3 shadow-2xl transition-all duration-200 border border-white/10 hover:border-white/20"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}
      
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
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
        } fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-in-out min-h-screen flex flex-col bg-black border-r border-white/10 text-white shadow-2xl`}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        )}
        
        {/* Top section - Logo */}
        <div className="flex items-center px-6 py-6 border-b border-white/10 bg-white/5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Anilyst
          </span>
        </div>
        
        {/* Main navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.path}>
                  <div 
                    className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-500/30 backdrop-blur-sm'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => handleItemClick(item.path)}
                  >
                    {item.special ? (
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <IconComponent className={`w-5 h-5 mr-3 transition-colors ${
                        isActive(item.path) ? 'text-blue-400' : 'text-white/50 group-hover:text-blue-400'
                      }`} />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Bottom section */}
        <div className="px-4 pb-6 space-y-4">
          {/* Upload Data button */}
          <button
            onClick={handleUploadClick}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 text-center transition-all duration-200 group backdrop-blur-sm"
          >
            <div className="flex items-center justify-center">
              {hasData() ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
              ) : (
                <Upload className="w-5 h-5 text-white/60 group-hover:text-blue-400 mr-3 transition-colors" />
              )}
              <div className="text-left">
                <div className="font-semibold text-white">
                  {hasData() ? 'Data Loaded' : 'Upload Data'}
                </div>
                {hasData() && currentFile && (
                  <div className="text-xs text-emerald-400 truncate max-w-[150px]">
                    {currentFile.name}
                  </div>
                )}
              </div>
            </div>
          </button>
          
          {/* Upgrade box */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl p-4 backdrop-blur-sm">
            <Link href="/pricing" className="block">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-amber-400 mr-2" />
                  <span className="font-semibold text-white">Upgrade</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-sm text-white/70 mb-3">
                Get unlimited access and advanced features
              </p>
              <div className="text-sm text-white/50 mb-2">0/3 Analysis Free</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 w-0 rounded-full"></div>
              </div>
            </Link>
          </div>
          
          {/* User Profile */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Mohd Kaif</div>
              <div className="text-sm text-white/50">kaifmohd@gmail.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Upload Modal */}
      <UploadModal />
    </>
  );
}
