"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, BarChart, ArrowRight, Lightbulb, LineChart, User, Zap, Server, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

const BackendSourceTag = ({ type }: { type: 'prediction' | 'analysis' | 'insights' }) => {
  const getIcon = () => {
    switch (type) {
      case 'prediction':
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
      case 'analysis':
        return <Server className="w-3.5 h-3.5 text-blue-400" />;
      case 'insights':
      default:
        return <Brain className="w-3.5 h-3.5 text-green-400" />;
    }
  };

  const getText = () => {
    switch (type) {
      case 'prediction':
        return 'FastAPI Forecasting Engine';
      case 'analysis':
        return 'FastAPI Statistical Engine';
      case 'insights':
      default:
        return 'AI Insights Engine';
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-full border border-white/10 text-xs">
      {getIcon()}
      <span className="text-white/80">{getText()}</span>
    </div>
  );
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
    if (!text) return `No ${section.toLowerCase()} available`;
    
    try {
      // First try to extract from the format "**Section:**" 
      if (text.includes(`**${section}:**`)) {
        return text.split(`**${section}:**`)[1]?.split('**')[0]?.trim() || `No ${section.toLowerCase()} available`;
      }
      
      // Try alternative format for section headers
      if (text.includes(`${section}:`)) {
        return text.split(`${section}:`)[1]?.split('\n\n')[0]?.trim() || `No ${section.toLowerCase()} available`;
      }
      
      // Handle statistical sections
      if (section === '1. Direct Answer' && text.includes('mean')) {
        // Extract information about means, trends, or basic statistics
        return text.split('Statistical Analysis Results')[1]?.split('Key Statistics')[0]?.trim() || 
               'Statistical analysis completed. See details below.';
      }
      
      if (section === '2. Key Insights' && text.includes('Mean')) {
        // Extract mean, median, statistics information 
        return text.split('Key Statistics:')[1]?.split('Trend Analysis')[0]?.trim() || 
               text.split('Mean:')[1]?.split('Trend')[0]?.trim() ||
               'Key statistics compiled from your data';
      }
      
      if (section === '3. Relevant Trends' && text.includes('trend')) {
        // Extract trend information
        return text.split('Trend Analysis:')[1]?.split('Statistical Significance')[0]?.trim() ||
               text.split('trend')[0]?.split('trend')[1]?.trim() ||
               'Trend analysis performed on your data';
      }
      
      if (section === '4. Statistical Significance') {
        // Extract statistical significance info
        return text.split('Statistical Significance:')[1]?.split('Additional')[0]?.trim() ||
               text.split('significant')[0]?.split('significant')[1]?.trim() ||
               'Statistical significance determined based on data patterns';
      }
      
      // Fallback
      return `No ${section.toLowerCase()} available`;
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
              
              {/* Answer - Handle Predictions differently */}
              <div className="flex items-start gap-3 pl-12">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  {chat.question.includes("predict") || chat.answer.includes("Prediction Results") ? (
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Brain className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white/90 mb-4">
                    {chat.question.includes("predict") || chat.answer.includes("Prediction Results") 
                      ? "Prediction Results" 
                      : "Analysis Results"}
                  </h3>

                  {/* For prediction results, render with markdown */}
                  {(chat.question.includes("predict") || chat.answer.includes("Prediction Results")) ? (
                    <div className="text-white/80 leading-relaxed prediction-result">
                      <ReactMarkdown 
                        components={{
                          p: ({children, ...props}) => <p className="mb-3" {...props}>{children}</p>,
                          h3: ({children, ...props}) => <h3 className="text-purple-400 font-medium mb-2" {...props}>{children}</h3>,
                          ul: ({children, ...props}) => <ul className="mb-4 list-disc pl-5" {...props}>{children}</ul>,
                          li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                          strong: ({children, ...props}) => <strong className="text-blue-400" {...props}>{children}</strong>,
                        }}
                      >
                        {chat.answer}
                      </ReactMarkdown>
                      
                      {/* Add a visual divider */}
                      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-yellow-400">AI-powered prediction</span>
                        <BackendSourceTag type="prediction" />
                      </div>
                    </div>
                  ) : chat.question.includes("statistical") || chat.answer.includes("Statistical Analysis Results") ? (
                    /* Special handling for statistical analysis results */
                    <div className="text-white/80 leading-relaxed statistical-result">
                      <ReactMarkdown 
                        components={{
                          p: ({children, ...props}) => <p className="mb-3" {...props}>{children}</p>,
                          h3: ({children, ...props}) => <h3 className="text-blue-400 font-medium mb-2" {...props}>{children}</h3>,
                          ul: ({children, ...props}) => <ul className="mb-4 list-disc pl-5" {...props}>{children}</ul>,
                          li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                          strong: ({children, ...props}) => <strong className="text-green-400" {...props}>{children}</strong>,
                        }}
                      >
                        {`📊 **Statistical Analysis Results**

${extractSection(chat.answer, '1. Direct Answer')}

**Key Statistics:**
${extractSection(chat.answer, '2. Key Insights')}

**Trend Analysis:**
${extractSection(chat.answer, '3. Relevant Trends')}

**Statistical Significance:**
${extractSection(chat.answer, '4. Statistical Significance')}

**Recommendations:**
${chat.answer.includes("Recommendations:") ? chat.answer.split("Recommendations:")[1].split("AI-powered")[0].trim() : "No specific recommendations available."}`}
                      </ReactMarkdown>
                      
                      {/* Add a visual divider */}
                      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-blue-400">Statistical insights from your data</span>
                        <BackendSourceTag type="analysis" />
                      </div>
                    </div>
                  ) : (
                    // Regular analysis display (unchanged)
                    <>
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

                      <div className="mt-6 flex items-center justify-between">
                        <BackendSourceTag type="analysis" />
                        <div className="text-xs text-white/50 italic">Processed by Python analytics engine</div>
                      </div>
                    </>
                  )}
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
                  
                  {/* Check if it's a statistical analysis response */}
                  {insights.queryResponse.answer.includes("Statistical Analysis Results") ? (
                    <div className="text-gray-300 leading-relaxed">
                      <ReactMarkdown 
                        components={{
                          p: ({children, ...props}) => <p className="mb-3" {...props}>{children}</p>,
                          h3: ({children, ...props}) => <h3 className="text-blue-400 font-medium mb-2" {...props}>{children}</h3>,
                          ul: ({children, ...props}) => <ul className="mb-4 list-disc pl-5" {...props}>{children}</ul>,
                          li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                          strong: ({children, ...props}) => <strong className="text-green-400" {...props}>{children}</strong>,
                        }}
                      >
                        {`📊 **Statistical Analysis Results**

${extractSection(insights.queryResponse.answer, '1. Direct Answer')}

**Key Statistics:**
${extractSection(insights.queryResponse.answer, '2. Key Insights')}

**Trend Analysis:**
${extractSection(insights.queryResponse.answer, '3. Relevant Trends')}

**Statistical Significance:**
${extractSection(insights.queryResponse.answer, '4. Statistical Significance')}

${insights.queryResponse.answer.includes("Recommendations:") ? 
  "**Recommendations:**\n" + insights.queryResponse.answer.split("Recommendations:")[1].split("Additional")[0].trim() : 
  ""}`}
                      </ReactMarkdown>
                      
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-blue-400">Statistical insights from your data</span>
                        <BackendSourceTag type="analysis" />
                      </div>
                    </div>
                  ) : (
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
                  )}
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