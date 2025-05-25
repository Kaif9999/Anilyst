"use client";

import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Clock,
  Users,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {['Visualizations', 'Analysis', 'Reports', 'Projects'].map((item, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{item}</h3>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                {index === 0 && <BarChart2 className="w-5 h-5 text-blue-400" />}
                {index === 1 && <Activity className="w-5 h-5 text-green-400" />}
                {index === 2 && <TrendingUp className="w-5 h-5 text-purple-400" />}
                {index === 3 && <Users className="w-5 h-5 text-orange-400" />}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{index * 3 + 1}</p>
            <p className="text-sm text-gray-400 mt-1">
              {index % 2 === 0 ? '+1 new today' : 'Last updated 2h ago'}
            </p>
          </div>
        ))}
      </div>
      
      {/* Recent activity */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            'Created new visualization from sales_data.csv',
            'Ran predictive analysis on user engagement metrics',
            'Generated monthly report for Q2 performance',
            'Added new dataset from marketing campaign'
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white">{activity}</p>
                <p className="text-sm text-gray-400">{index + 1} hour{index !== 0 ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
