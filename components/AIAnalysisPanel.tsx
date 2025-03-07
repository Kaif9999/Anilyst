"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, BarChart, ArrowRight, Lightbulb, LineChart, User } from 'lucide-react';

interface AIAnalysisPanelProps {
  insights: {
    trends: string[];
    anomalies: string[];
    correlations: {
      variables: [string, string];
      strength: number;
      description: string;
    }[];
    statistics: {
      mean: number;
      median: number;
      mode: number;
      outliers: number[];
    };
    queryResponse?: {
      question: string;
      answer: string;
      timestamp: string;
    };
  };
  recommendations?: string[];
  chatHistory?: { question: string; answer: string }[];
}

const defaultInsights = {
  trends: [],
  anomalies: [],
  correlations: [],
  statistics: {
    mean: 0,
    median: 0,
    mode: 0,
    outliers: [],
  },
  queryResponse: {
    question: "",
    answer: "",
    timestamp: new Date().toISOString(),
  },
};

export default function AIAnalysisPanel({ 
  insights = defaultInsights,
  recommendations = [],
  chatHistory = []
}: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('insights');
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  
  const tabs = [
    { id: 'insights', label: 'Key Insights', icon: Brain },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'correlations', label: 'Correlations', icon: BarChart },
  ];

  // Safely extract sections from the answer
  const extractSection = (text: string, section: string) => {
    try {
      return text.split(`**${section}:**`)[1]?.split('**')[0]?.trim() || `No ${section.toLowerCase()} available`;
    } catch (error) {
      return `No ${section.toLowerCase()} available`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tab Navigation */}
      {/* <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div> */}

      {/* Chat History Section */}
      <div className="chat-history bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-6 max-h-[500px] overflow-y-auto">
        {chatHistory.length > 0 ? (
          chatHistory.map((chat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-6 last:mb-0"
            >
              {/* Question */}
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1">
                  <p className="text-white/80">Q: {chat.question}</p>
                </div>
              </div>
              
              {/* Answer */}
              <div className="flex items-start gap-3 pl-12">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white/90 mb-4">
                    Analysis Results
                  </h3>
                  
                  {/* Direct Answer */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">
                      1. Direct Answer
                    </h4>
                    <p className="text-white/80 leading-relaxed">
                      {extractSection(chat.answer, '1. Direct Answer')}
                    </p>
                  </div>

                  {/* Key Insights */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">
                      2. Key Insights
                    </h4>
                    <p className="text-white/80 leading-relaxed">
                      {extractSection(chat.answer, '2. Key Insights')}
                    </p>
                  </div>

                  {/* Relevant Trends */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-400 mb-2">
                      3. Relevant Trends
                    </h4>
                    <p className="text-white/80 leading-relaxed">
                      {extractSection(chat.answer, '3. Relevant Trends')}
                    </p>
                  </div>

                  {/* Statistical Significance */}
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">
                      4. Statistical Significance
                    </h4>
                    <p className="text-white/80 leading-relaxed">
                      {extractSection(chat.answer, '4. Statistical Significance')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : insights?.queryResponse ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">
                    Q: {insights.queryResponse.question || "Analysis Request"}
                  </h4>
                  <div className="text-gray-300 leading-relaxed space-y-4">
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-purple-400 mb-2">Direct Answer</h5>
                      <p>{extractSection(insights.queryResponse.answer, '1. Direct Answer')}</p>
                    </div>
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-blue-400 mb-2">Key Insights</h5>
                      <p>{extractSection(insights.queryResponse.answer, '2. Key Insights')}</p>
                    </div>
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-green-400 mb-2">Relevant Trends</h5>
                      <p>{extractSection(insights.queryResponse.answer, '3. Relevant Trends')}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-yellow-400 mb-2">Statistical Significance</h5>
                      <p>{extractSection(insights.queryResponse.answer, '4. Statistical Significance')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No analysis available yet. Upload a file to get started.
          </div>
        )}
      </div>
      
      {/* Tab Content Section */}
      {/* <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 pt-0 p-6"
        >
          <div className="flex space-x-2 mt-6 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={`bottom-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

          
          <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-purple-400 mb-2">
              Direct Answer
            </h4>
            <p className="text-white/90 leading-relaxed">
              {insights.queryResponse?.answer.split('**1. Direct Answer:**')[1]?.split('**2.')[0] || 'No direct answer available'}
            </p>
          </div>

        
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Key Insights</h3>
              </div>
              <div className="grid gap-4">
                {insights.queryResponse?.answer.split('**2. Key Insights:**')[1]?.split('**3.')[0]
                  .split('*')
                  .filter(Boolean)
                  .map((insight, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                          <Lightbulb className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-white/80 leading-relaxed">{insight.trim()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Identified Trends</h3>
              </div>
              <div className="grid gap-4">
                {insights.trends.map((trend, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                        <LineChart className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white/90 font-medium mb-1">
                          Trend Pattern {index + 1}
                        </h4>
                        <p className="text-white/80 leading-relaxed">{trend}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <h3 className="text-xl font-semibold text-white">Detected Anomalies</h3>
              </div>
              <div className="grid gap-4">
                {insights.anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-white/90 font-medium mb-1">
                          Anomaly {index + 1}
                        </h4>
                        <p className="text-white/80 leading-relaxed">{anomaly}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
    
          {activeTab === 'correlations' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Data Correlations</h3>
              </div>
              <div className="grid gap-4">
                {insights.correlations.map((correlation, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg shrink-0">
                        <BarChart className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white/90 font-medium">
                            {correlation.variables.join(' → ')}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            correlation.strength > 0.7
                              ? 'bg-green-500/20 text-green-300'
                              : correlation.strength > 0.4
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {(correlation.strength * 100).toFixed(1)}% correlation
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed">{correlation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence> */}
    </div>
  );
}