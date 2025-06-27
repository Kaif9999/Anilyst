"use client";

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, User, Send, Trash2, 
  BarChart3, Brain, TrendingUp,
  Loader2, Copy, Check, Mic, Settings,
  Sparkles, Database, FileText, Calendar,
  Activity, PieChart, LineChart, AlertCircle,
  Upload, Plus
} from 'lucide-react';
import { useFileStore } from '@/store/file-store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysis_results?: any;
  dataContext?: {
    fileName: string;
    rowCount: number;
    dataType: string;
    columns: string[];
  };
}

const EXAMPLE_PROMPTS = [
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Statistical Analysis",
    description: "Analyze my data and provide statistical insights",
    prompt: "📊 Analyze my data and provide comprehensive statistical insights including distributions, correlations, and key metrics"
  },
  {
    icon: <Database className="h-4 w-4" />,
    title: "Data Structure",
    description: "Help me understand my dataset structure",
    prompt: "🔍 Help me understand my dataset structure, data types, missing values, and data quality issues"
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Pattern Recognition",
    description: "What are the key patterns in my data?",
    prompt: "📈 What are the key patterns, trends, and anomalies in my data? Show me the most important insights"
  },
  {
    icon: <Brain className="h-4 w-4" />,
    title: "Business Intelligence",
    description: "Generate business insights from my data",
    prompt: "💼 Generate actionable business insights and KPIs from my data with recommendations for decision making"
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Data Questions",
    description: "What questions should I ask about my data?",
    prompt: "🤔 What are the most important questions I should ask about my data to uncover valuable insights?"
  },
  {
    icon: <FileText className="h-4 w-4" />,
    title: "Data Quality",
    description: "Help me identify data quality issues",
    prompt: "🔧 Help me identify and fix data quality issues including outliers, missing values, and inconsistencies"
  }
];

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get file data from Zustand store
  const { 
    currentFile, 
    hasData, 
    chartData,
    setUploadModalOpen 
  } = useFileStore();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Get data context for analysis
  const getDataContext = () => {
    if (!hasData() || !chartData) return null;

    const columns = chartData.labels || [];
    const datasetInfo = chartData.datasets?.[0] || {};
    
    return {
      fileName: currentFile?.name || 'Unknown File',
      rowCount: currentFile?.rowCount || (datasetInfo.data?.length || 0),
      dataType: 'Chart Data',
      columns,
      totalColumns: columns.length,
      hasChartData: !!chartData
    };
  };

  // Format user prompt with context
  const formatUserPrompt = (input: string, hasData: boolean, dataContext: any): string => {
    let prompt = input.trim();
    
    if (hasData && dataContext) {
      prompt += `\n\nCONTEXT: I have uploaded a dataset "${dataContext.fileName}" with ${dataContext.rowCount} data points. Please analyze this data in your response.`;
    } else {
      prompt += `\n\nCONTEXT: I don't have any data uploaded yet. Please provide general guidance and suggest what data I should upload for better analysis.`;
    }
    
    return prompt;
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const dataContext = getDataContext();
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      dataContext: dataContext ? {
        fileName: dataContext.fileName,
        rowCount: dataContext.rowCount,
        dataType: dataContext.dataType,
        columns: dataContext.columns
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      if (hasData() && chartData) {
        // Use the existing query API for data analysis
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: formatUserPrompt(currentInput, true, dataContext),
            data: chartData,
            context: null
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();
        
        let responseContent = result.insights?.queryResponse?.answer || 'No analysis available';
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: result.insights?.queryResponse?.timestamp || new Date().toISOString(),
          analysis_results: result,
          dataContext: dataContext ? {
            fileName: dataContext.fileName,
            rowCount: dataContext.rowCount,
            dataType: dataContext.dataType,
            columns: dataContext.columns
          } : undefined
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const guidanceMessage: Message = {
          role: 'assistant',
          content: `I'd be happy to help you analyze your data! However, I don't see any data uploaded yet.

**To get started:**
1. Click the "Upload Data" button in the sidebar
2. Upload a CSV, Excel, or other data file
3. Once uploaded, I can help you with:
   • Statistical analysis and insights
   • Pattern recognition
   • Data quality assessment
   • Business intelligence
   • Predictive analysis

**What I can analyze:**
• Sales data and revenue trends
• Customer behavior patterns
• Financial performance metrics
• Operational efficiency data
• Marketing campaign results
• And much more!

Please upload your data first, then ask me any questions about it. I'm here to help you uncover valuable insights from your data!`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, guidanceMessage]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ I apologize, but I encountered an error while analyzing your data.

**Error Details:**
${error instanceof Error ? error.message : 'Unknown error occurred'}

**What you can try:**
1. Make sure your data is properly formatted
2. Try asking a simpler question
3. Check if the data file is not corrupted
4. Refresh the page and try again

**Your Question:** "${currentInput}"

Please try rephrasing your question or check your data format.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyMessage = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageIndex.toString());
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const useExamplePrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Get contextual prompts based on data availability
  const getContextualPrompts = () => {
    if (!hasData()) {
      return [
        {
          icon: <Upload className="h-4 w-4" />,
          title: "Upload Data",
          description: "Click 'Upload Data' in the sidebar to get started",
          prompt: "How do I upload data to analyze?"
        },
        {
          icon: <FileText className="h-4 w-4" />,
          title: "Supported Formats",
          description: "What file formats can I upload?",
          prompt: "What file formats do you support for data analysis?"
        },
        {
          icon: <Brain className="h-4 w-4" />,
          title: "Analysis Types",
          description: "What kind of analysis can you perform?",
          prompt: "What types of data analysis can you help me with?"
        }
      ];
    }

    return EXAMPLE_PROMPTS;
  };

  const contextualPrompts = getContextualPrompts();

  // Data Status Component
  const DataStatusBadge = () => {
    if (!hasData()) return null;

    const dataContext = getDataContext();
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <Database className="h-3 w-3 mr-1" />
          {dataContext?.rowCount?.toLocaleString()} points
        </Badge>
        <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <FileText className="h-3 w-3 mr-1" />
          {dataContext?.totalColumns} columns
        </Badge>
        <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <PieChart className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      </div>
    );
  };

  // Welcome screen when no messages
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col bg-black text-white overflow-hidden">
        {/* Fixed Header - Dark theme like landing page */}
        <div className="bg-black/90 backdrop-blur-sm border-b border-white/10 flex-shrink-0 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">Data Analysis</h1>
                <p className="text-xs text-white/60">
                  {hasData() 
                    ? `${currentFile?.name} • ${currentFile?.rowCount?.toLocaleString()} points`
                    : 'OpenAI-powered analysis assistant'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DataStatusBadge />
              {!hasData() && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  No Data
                </Badge>
              )}
              <button className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Dark theme */}
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="h-full flex flex-col justify-center items-center px-6 py-8">
            <div className="max-w-4xl w-full text-center">
              {/* Welcome Section */}
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {hasData() ? "Let's analyze your data" : "Ready for data analysis?"}
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                  {hasData() 
                    ? `I have access to "${currentFile?.name}" with ${currentFile?.rowCount?.toLocaleString()} data points. Ask me anything about patterns, trends, or insights.`
                    : "Upload your data first, then I can help you with comprehensive analysis and insights."
                  }
                </p>
              </div>

              {/* Example Prompts Grid - Dark theme */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {contextualPrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExamplePrompt(example.prompt)}
                    disabled={!hasData() && !example.title.includes("Upload") && !example.title.includes("Supported") && !example.title.includes("Analysis Types")}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                      !hasData() && !example.title.includes("Upload") && !example.title.includes("Supported") && !example.title.includes("Analysis Types")
                        ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        !hasData() && !example.title.includes("Upload") && !example.title.includes("Supported") && !example.title.includes("Analysis Types")
                          ? 'bg-white/5 text-white/40'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {example.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-2 ${
                          !hasData() && !example.title.includes("Upload") && !example.title.includes("Supported") && !example.title.includes("Analysis Types")
                            ? 'text-white/40'
                            : 'text-white'
                        }`}>
                          {example.title}
                        </h3>
                        <p className={`text-sm ${
                          !hasData() && !example.title.includes("Upload") && !example.title.includes("Supported") && !example.title.includes("Analysis Types")
                            ? 'text-white/30'
                            : 'text-white/60'
                        }`}>
                          {example.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Input Area - ChatGPT style */}
        <div className="sticky bottom-0 bg-black/95 backdrop-blur-sm border-t border-white/10 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 focus-within:border-white/30 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={hasData() ? `Ask anything about ${currentFile?.name}...` : "Upload data first, then ask me questions..."}
                className="w-full bg-transparent text-white placeholder-white/50 resize-none border-0 outline-none px-4 py-3 pr-12 min-h-[60px] max-h-[200px]"
                disabled={isLoading}
                rows={1}
              />
              
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button 
                  type="button"
                  className="text-white/50 hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="bg-white text-black rounded-lg h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <p className="text-xs text-white/50">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Enter</kbd> to send • 
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono ml-1">Shift + Enter</kbd> for new line
                {hasData() && (
                  <span className="ml-2 text-blue-400">• Ready to analyze {currentFile?.name}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface when messages exist
  return (
    <div className="h-full flex flex-col bg-black text-white overflow-hidden">
      {/* Fixed Header - Chat Mode */}
      <div className="bg-black/90 backdrop-blur-sm border-b border-white/10 flex-shrink-0 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Data Analysis</span>
              {hasData() && currentFile && (
                <p className="text-xs text-white/60">
                  {currentFile.name} • {currentFile.rowCount?.toLocaleString()} points
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Online
            </Badge>
            <DataStatusBadge />
            <button
              onClick={clearChat}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - Fixed height, scrollable with padding for sticky input */}
      <div className="flex-1 overflow-y-auto bg-black pb-32">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'bg-white/5 border border-white/10 text-white'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* Data Context Display */}
                    {message.dataContext && (
                      <div className={`mt-3 pt-3 ${
                        message.role === 'user' ? 'border-t border-white/20' : 'border-t border-white/10'
                      }`}>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {message.dataContext.fileName}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            <Database className="h-3 w-3 mr-1" />
                            {message.dataContext.rowCount.toLocaleString()} points
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Message Footer */}
                    <div className={`flex items-center justify-between mt-3 pt-2 ${
                      message.role === 'user' ? 'border-t border-white/20' : 'border-t border-white/10'
                    }`}>
                      <span className={`text-xs ${
                        message.role === 'user' ? 'text-white/60' : 'text-white/50'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      <button
                        onClick={() => copyMessage(message.content, index)}
                        className={`p-1 rounded transition-colors ${
                          message.role === 'user' 
                            ? 'text-white/60 hover:text-white' 
                            : 'text-white/50 hover:text-white/70'
                        }`}
                      >
                        {copiedMessageId === index.toString() ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-white/10 text-white border border-white/20">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm">
                      {hasData() 
                        ? `Analyzing ${currentFile?.name}...`
                        : 'Processing your request...'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Sticky Input Area - ChatGPT style for chat mode */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 focus-within:border-white/30 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={hasData() ? `Ask anything about ${currentFile?.name}...` : "Upload data first..."}
              className="w-full bg-transparent text-white placeholder-white/50 resize-none border-0 outline-none px-4 py-3 pr-12 min-h-[60px] max-h-[200px]"
              disabled={isLoading}
              rows={1}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <button 
                type="button"
                className="text-white/50 hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-colors"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </button>
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="bg-white text-black rounded-lg h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-white/50">
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Enter</kbd> to send • 
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono ml-1">Shift + Enter</kbd> for new line
              {hasData() && (
                <span className="ml-2 text-blue-400">• {currentFile?.name} ({currentFile?.rowCount?.toLocaleString()} points)</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}