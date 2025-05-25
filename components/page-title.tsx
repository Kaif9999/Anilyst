"use client";

import { usePathname } from 'next/navigation';

export default function PageTitle() {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname.includes('/visualizations')) return 'Visualizations';
    if (pathname.includes('/analysis')) return 'Analysis';
    if (pathname.includes('/reports-analysis')) return 'Reports Analysis';
    if (pathname.includes('/agent')) return 'Anilyst Agent';
    if (pathname === '/dashboard') return 'Dashboard';
    return 'Dashboard';
  };
  
  const getDescription = () => {
    if (pathname.includes('/visualizations')) return 'Create and manage data visualizations';
    if (pathname.includes('/analysis')) return 'Analyze your data with AI';
    if (pathname.includes('/reports-analysis')) return 'Generate reports from your analysis';
    if (pathname.includes('/agent')) return 'Let our AI agent analyze your data';
    return 'Welcome to your analytics dashboard';
  };
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
      <p className="text-gray-400">{getDescription()}</p>
    </div>
  );
}