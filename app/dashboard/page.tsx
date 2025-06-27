"use client";

import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  FileText,
  Zap,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Visualizations',
      value: '12',
      change: '+3 this week',
      trend: 'up',
      icon: BarChart2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Analysis',
      value: '8',
      change: '+2 this week',
      trend: 'up',
      icon: Activity,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Reports',
      value: '5',
      change: '+1 this week',
      trend: 'up',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Projects',
      value: '3',
      change: 'No change',
      trend: 'neutral',
      icon: Target,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentActivities = [
    {
      title: 'Created new visualization from sales_data.csv',
      time: '2 hours ago',
      type: 'visualization',
      icon: BarChart2
    },
    {
      title: 'Ran predictive analysis on user engagement metrics',
      time: '4 hours ago',
      type: 'analysis',
      icon: TrendingUp
    },
    {
      title: 'Generated monthly report for Q2 performance',
      time: '6 hours ago',
      type: 'report',
      icon: FileText
    },
    {
      title: 'Added new dataset from marketing campaign',
      time: '1 day ago',
      type: 'data',
      icon: Zap
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 text-white">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Welcome back, Mohd!</h1>
        <p className="text-gray-300 text-lg">Here's what's happening with your analytics today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 md:p-6 hover:bg-white/10 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{stat.title}</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className={`text-sm flex items-center ${
                  stat.trend === 'up' ? 'text-green-400' : 
                  stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">Recent Activity</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-blue-400/10">
              View all
            </button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 md:p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium leading-relaxed">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Quick Actions & Usage Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg md:text-xl font-bold text-white mb-5">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 font-medium transition-colors text-left">
                Create Visualization
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg p-4 font-medium transition-colors text-left">
                Run Analysis
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg p-4 font-medium transition-colors text-left">
                Generate Report
              </button>
            </div>
          </div>
          
          {/* Usage Stats */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg md:text-xl font-bold text-white mb-5">Usage This Month</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400 font-medium">Analyses</span>
                  <span className="text-white font-semibold">8/10</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400 font-medium">Storage</span>
                  <span className="text-white font-semibold">2.3/5 GB</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{ width: '46%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
