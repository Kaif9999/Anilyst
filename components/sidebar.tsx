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
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('');

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
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Visualizations', path: '/dashboard/visualizations' },
    { name: 'Analysis', path: '/dashboard/analysis' },
    { name: 'Reports Analysis', path: '/dashboard/reports-analysis' },
    { name: 'Anilyst Agent', path: '/dashboard/agent', icon: 'agent' }
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
  
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed z-30 top-1/2 -translate-y-1/2 left-0 bg-gray-800 rounded-r-lg p-2 shadow-lg"
          aria-label="Toggle Menu"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
      
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
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
        } fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out min-h-screen flex flex-col bg-black text-white px-3 pt-4 pb-4 min-w-64`}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
        
        {/* Top section - Logo */}
        <div className="flex items-center mb-10 mt-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold">Anilyst</span>
        </div>
        
        {/* Main navigation */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <div 
                className={`pl-3 pt-3 pb-3 transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-900 text-white rounded-l-xl pr-6 relative -mr-3'
                    : 'text-white/80 hover:bg-white/15 rounded-xl pr-3'
                }`}
                onClick={() => handleItemClick(item.path)}
              >
                {/* Active */}
                {isActive(item.path) && (
                  <div className="absolute top-0 bottom-0 right-0 w-5 bg-gray-900" style={{ right: "-5px" }}></div>
                )}
                
                {item.name === 'Anilyst Agent' ? (
                  <div className="flex items-center relative z-10">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-sm flex items-center justify-center mr-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <span className="text-2xl font-medium">{item.name}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-medium relative z-10">
                    {item.name}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* Bottom section */}
        <div className="mt-auto space-y-4">
          {/* Upload Data button */}
          <Link href="/dashboard/upload">
            <div className="border-2 border-gray-700 rounded-xl p-4 text-center hover:bg-white/5 transition-colors flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-200 mr-1" />
              <span className="text-xl font-bold">Upload Data</span>
            </div>
          </Link>
          
          {/* Upgrade box */}
          <div className="border-2 border-gray-700 rounded-xl p-4">
            <div className="text-center mb-2">
               
              <Link href="/pricing" className="text-xl font-bold flex items-center justify-center border-2 border-gray-700 rounded-xl p-2">
               <Crown className="w-6 h-6 text-grray-200 mr-1" /> Upgrade </Link>
              <p className="text-sm text-gray-400">
                Get more features and unlimited access
              </p>
            </div>
            
            <div className="text-sm mb-1">0/3 Analysis Free</div>
            
            <div className="h-1 w-full bg-gray-700 rounded-full">
              <div className="h-1 rounded-full bg-gray-500 w-0"></div>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="border-2 border-gray-700 rounded-xl p-3 flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <div className="font-medium">Mohd Kaif</div>
              <div className="text-xs text-gray-400">kaifmohd@gmail.com</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
