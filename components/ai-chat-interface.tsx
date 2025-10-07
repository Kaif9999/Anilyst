"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Send, 
  BarChart3, Brain, TrendingUp,
  Loader2, Mic,
  Sparkles, Database, FileText, Calendar,
  Activity, PieChart, LineChart, AlertCircle,
  ArrowUp,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFileData } from '@/hooks/use-file-data';
import { useSidebar } from '@/app/dashboard/layout';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

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

interface AgentPageProps {
  isSidebarCollapsed?: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Statistical Analysis",
    description: "Analyze my data and provide statistical insights",
    prompt: "📊 Analyze my data and provide comprehensive statistical insights including distributions, correlations, and key metrics"
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Data Structure",
    description: "Help me understand my dataset structure",
    prompt: "🔍 Help me understand my dataset structure, data types, missing values, and data quality issues"
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Pattern Recognition",
    description: "What are the key patterns in my data?",
    prompt: "📈 What are the key patterns, trends, and anomalies in my data? Show me the most important insights"
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Business Intelligence",
    description: "Generate business insights from my data",
    prompt: "💼 Generate actionable business insights and KPIs from my data with recommendations for decision making"
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Data Questions",
    description: "What questions should I ask about my data?",
    prompt: "🤔 What are the most important questions I should ask about my data to uncover valuable insights?"
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Data Quality",
    description: "Help me identify data quality issues",
    prompt: " Help me identify and fix data quality issues including outliers, missing values, and inconsistencies"
  }
];

export default function AgentPage() {
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTransitionBox, setShowTransitionBox] = useState(false);
  const [transitionInput, setTransitionInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { 
    currentFile, 
    hasData, 
    rawData, 
    chartData, 
    aiAnalysis,
    isStockData,
    availableYears,
    selectedYear,
    error,
    isLoading: fileLoading
  } = useFileData();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    if (!isMounted) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMounted]);

  // Move style injection to useEffect
  useEffect(() => {
    if (!isMounted) return;
    
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isMounted]);

  const getDataContext = () => {
    if (!hasData || !rawData.length) return null;

    const columns = Object.keys(rawData[0]);
    const sampleData = rawData.slice(0, 5); 
    
    return {
      fileName: currentFile?.name || 'Unknown File',
      rowCount: currentFile?.rowCount || rawData.length,
      dataType: isStockData ? 'Stock/Financial Data' : 'General Data',
      columns,
      sampleData,
      totalColumns: columns.length,
      availableYears: availableYears.length > 0 ? availableYears : null,
      selectedYear: selectedYear !== 'all' ? selectedYear : null,
      hasChartData: !!chartData,
      previousAnalysis: aiAnalysis || null
    };
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 
  useEffect(() => {
    if (hasData && messages.length === 0 && isMounted && !fileLoading && rawData.length > 0) {
      const dataContext = getDataContext();
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Hello! I can see you've uploaded "${dataContext?.fileName}" with ${dataContext?.rowCount?.toLocaleString()} rows of ${dataContext?.dataType}.

** Data Status:** Loaded and ready for analysis
** Data Overview:**
• File: ${dataContext?.fileName}
• Rows: ${dataContext?.rowCount?.toLocaleString()}
• Columns: ${dataContext?.totalColumns} (${dataContext?.columns.slice(0, 5).join(', ')}${(dataContext?.totalColumns || 0) > 5 ? '...' : ''})
• Type: ${dataContext?.dataType}
${dataContext?.availableYears ? `• Years Available: ${dataContext.availableYears.join(', ')}` : ''}
${dataContext?.selectedYear ? `• Currently Viewing: ${dataContext.selectedYear}` : ''}

**🔍 Sample Data Preview:**
${dataContext?.sampleData.slice(0, 2).map((row, i) => 
  `Row ${i + 1}: ${Object.entries(row).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')}`
).join('\n')}

I have full access to your data and can perform comprehensive analysis. Ask me anything about:
• Statistical analysis and market insights
• Data patterns and trends
• Business recommendations
• Specific column analysis
• Stock performance (if applicable)

What would you like to explore first?`,
        timestamp: new Date().toISOString(),
        dataContext: dataContext ? {
          fileName: dataContext.fileName,
          rowCount: dataContext.rowCount,
          dataType: dataContext.dataType,
          columns: dataContext.columns
        } : undefined
      };
      setMessages([welcomeMessage]);
    }
  }, [hasData, currentFile, isStockData, messages.length, fileLoading, rawData, isMounted]);

  const handleSend = async (isFromWelcomeScreen = false) => {
    if (!input.trim() || isLoading) return;

    // Store the input value for transition
    const currentInput = input;
    setTransitionInput(currentInput);

    // Start transition if coming from welcome screen
    if (isFromWelcomeScreen && showWelcome) {
      setIsTransitioning(true);
      setShowTransitionBox(true);
      

      setTimeout(() => {
        setShowWelcome(false);
      }, 200);
      
   
      setTimeout(() => {
        setIsTransitioning(false);
        setShowTransitionBox(false);
        setTransitionInput('');
      }, 1200);
    }

    const dataContext = getDataContext();
    const userMessage: Message = {
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString(),
      dataContext: dataContext ? {
        fileName: dataContext.fileName,
        rowCount: dataContext.rowCount,
        dataType: dataContext.dataType,
        columns: dataContext.columns
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const requestPayload = {
        message: formatUserPrompt(currentInput, hasData, dataContext), 
        dataset: hasData && rawData.length > 0 ? {
          data: rawData.slice(0, 500), 
          metadata: {
            filename: currentFile?.name || 'uploaded_data.csv',
            total_rows: rawData.length,
            columns: dataContext?.columns || [],
            data_type: isStockData ? 'stock' : 'general',
            sample_size: Math.min(500, rawData.length),
            is_stock_data: isStockData,
            available_years: availableYears.length > 0 ? availableYears : [],
            selected_year: selectedYear !== 'all' ? selectedYear : 'all'
          }
        } : null,
        context: {
          has_uploaded_data: hasData,
          user_request_type: detectRequestType(currentInput),
          previous_analysis: aiAnalysis || null,
          handle_parsing_errors: true 
        }
      };

      console.log('🚀 Sending comprehensive request to FastAPI:', {
        url: `${FASTAPI_URL}/ai-chat`,
        hasData,
        dataRowCount: rawData.length,
        sampleSize: hasData ? Math.min(500, rawData.length) : 0,
        messageLength: currentInput.length,
        requestType: requestPayload.context.user_request_type
      });

      const response = await fetch(`${FASTAPI_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`;
        try {
          const errorData = await response.json();
          console.error(' FastAPI error response:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
          
          if (response.status === 422 && errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = `Validation error: ${errorData.detail.map((e: any) => 
                `${e.loc?.join('.') || 'field'}: ${e.msg}`
              ).join(', ')}`;
            } else {
              errorMessage = `Validation error: ${errorData.detail}`;
            }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(' FastAPI response received successfully');
      
      let responseContent = extractCleanResponse(result);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: result.timestamp || new Date().toISOString(),
        analysis_results: result.analysis_results,
        dataContext: dataContext ? {
          fileName: dataContext.fileName,
          rowCount: dataContext.rowCount,
          dataType: dataContext.dataType,
          columns: dataContext.columns
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "✨ Analysis Complete!",
        description: hasData ? 
          `AI analyzed ${Math.min(500, rawData.length)} rows from ${currentFile?.name}` : 
          "AI agent responded to your query",
      });

    } catch (error) {
      console.error('❌ AI Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: generateErrorMessage(error, hasData, dataContext, currentInput),
        timestamp: new Date().toISOString(),
        dataContext: dataContext ? {
          fileName: dataContext.fileName,
          rowCount: dataContext.rowCount,
          dataType: dataContext.dataType,
          columns: dataContext.columns
        } : undefined
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Analysis Error",
        description: hasData ? 
          "Failed to analyze data - backend agent error detected" : 
          "Please upload data first to enable analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to detect request type
  const detectRequestType = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('market') || lowerInput.includes('stock') || lowerInput.includes('invest')) {
      return 'market_analysis';
    } else if (lowerInput.includes('statistical') || lowerInput.includes('correlat') || lowerInput.includes('pattern')) {
      return 'statistical_analysis';
    } else if (lowerInput.includes('predict') || lowerInput.includes('forecast')) {
      return 'prediction';
    } else if (lowerInput.includes('visualiz') || lowerInput.includes('chart') || lowerInput.includes('plot')) {
      return 'visualization';
    }
    return 'general_analysis';
  };


  const extractCleanResponse = (result: any): string => {

    let responseContent = result.response || result.message || result.output || result.answer || '';
    
   
    if (result.status === 'fallback' && result.error) {
      console.info('Using fallback response due to agent error'); 
    }
    

    if (result.status === 'error') {
      return result.response || 'I encountered an error processing your request. Please try again.';
    }
    

    if (responseContent.includes('Thought:') || responseContent.includes('Action:')) {
      const patterns = [
        /AI:\s*(.*?)(?:\n```|$)/,
        /Final Answer:\s*(.*?)(?:\n```|$)/,
        /Answer:\s*(.*?)(?:\n```|$)/,
        /Response:\s*(.*?)(?:\n```|$)/
      ];
      
      for (const pattern of patterns) {
        const match = responseContent.match(pattern);
        if (match && match[1]) {
          responseContent = match[1].trim();
          break;
        }
      }
    }
    
    // Remove any remaining agent artifacts
    responseContent = responseContent
      .replace(/^Thought:.*$/gm, '')
      .replace(/^Action:.*$/gm, '')
      .replace(/^Action Input:.*$/gm, '')
      .replace(/^Observation:.*$/gm, '')
      .replace(/```$/, '')
      .trim();
    
    // Fallback if content is empty
    if (!responseContent) {
      responseContent = 'I received your message, but there was an issue with the response format. Could you please rephrase your question?';
    }
    
    return responseContent;
  };

  // Enhanced error message generator
  const generateErrorMessage = (error: any, hasData: boolean, dataContext: any, userInput: string): string => {
    const errorStr = error instanceof Error ? error.message : String(error);
    
    // Handle parsing errors specifically
    if (errorStr.includes('parsing error') || errorStr.includes('Could not parse LLM output')) {
      return `I understand your question "${userInput.slice(0, 100)}${userInput.length > 100 ? '...' : ''}", but there was a formatting issue with my response.

**What you asked about:** ${userInput}

**Issue:** The AI agent had trouble formatting the response properly, but I can still help you.

**For investment analysis questions like yours:**
• I can analyze uploaded stock data for investment insights
• I can provide general investment guidance and market analysis frameworks  
• I can help evaluate company fundamentals if you upload financial data
• I can compare different investment options with your data

**To get better analysis:**
1. Upload relevant financial/stock data for the company/market you're interested in
2. Ask specific questions about the data (e.g., "What are the key trends?", "Should I invest based on this data?")
3. Request specific metrics or comparisons

${hasData ? `**Your current data:** I can see you have "${dataContext?.fileName}" loaded with ${dataContext?.rowCount?.toLocaleString()} rows. I can analyze this for investment insights.` : '**No data loaded:** Upload financial data to get specific investment analysis.'}

Would you like to rephrase your question or upload some data for me to analyze?`;
    }
    
    // Handle other errors
    return hasData 
      ? `I apologize, but I encountered an error while analyzing "${dataContext?.fileName}".

**Error Details:**
${errorStr}

**Your Question:** "${userInput}"

**Data Context Available:**
• File: ${dataContext?.fileName}
• Rows: ${dataContext?.rowCount?.toLocaleString()}
• Columns: ${dataContext?.columns?.length}
• Sample Size Sent: ${Math.min(500, (dataContext as any)?.sampleData?.length || 0)} rows

**What I can still help with:**
• General questions about your data structure
• Data analysis methodology
• Interpretation guidance
• Alternative analysis approaches

**To resolve this issue:**
1. Try rephrasing your question more simply
2. Ask about specific columns or data points
3. Request a different type of analysis
4. Check if the data format is compatible

Please try a simpler question about your dataset.`
      : `I can help you with data analysis, but I need data to work with first.

**Your Question:** "${userInput}"

**To get started:**
1. Click "Upload Data" in the sidebar
2. Upload a CSV or Excel file
3. Ask me questions about your data

**What I can help with once you upload data:**
• Statistical analysis and insights
• Market analysis (for stock data)
• Investment recommendations (with financial data)
• Pattern recognition
• Business intelligence
• Data quality assessment

Would you like to upload some data to analyze?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(showWelcome);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    toast({
      title: "🔄 Chat Cleared",
      description: "Conversation history has been reset"
    });
  };

  const copyMessage = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageIndex.toString());
      setTimeout(() => setCopiedMessageId(null), 2000);
      
      toast({
        title: "📋 Copied!",
        description: "Message copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const useExamplePrompt = (prompt: string) => {
    setInput(prompt);
    if (showWelcome) {
      welcomeTextareaRef.current?.focus();
    } else {
      textareaRef.current?.focus();
    }
  };

  const getContextualPrompts = () => {
    if (!hasData) {
      return [
        {
          icon: <Database className="h-5 w-5" />,
          title: "Upload Data",
          description: "Click 'Upload Data' in the sidebar to get started",
          prompt: "How do I upload data to analyze?"
        },
        {
          icon: <FileText className="h-5 w-5" />,
          title: "Supported Formats",
          description: "What file formats can I upload?",
          prompt: "What file formats do you support for data analysis?"
        },
        {
          icon: <Brain className="h-5 w-5" />,
          title: "Analysis Types",
          description: "What kind of analysis can you perform?",
          prompt: "What types of data analysis can you help me with?"
        }
      ];
    }

    const dataContext = getDataContext();
    const basePrompts = [...EXAMPLE_PROMPTS];

    // Add data-specific prompts
    if (isStockData) {
      basePrompts.push({
        icon: <LineChart className="h-5 w-5" />,
        title: "Stock Analysis",
        description: "Analyze stock performance and trends",
        prompt: "📈 Analyze the stock performance trends, volatility, and key price movements in my data"
      });
      
      basePrompts.push({
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Market Report",
        description: "Generate a comprehensive market analysis report",
        prompt: "📊 Generate a comprehensive market analysis report for this stock data including key insights, trends, and investment recommendations"
      });
      
      if (availableYears.length > 1) {
        basePrompts.push({
          icon: <Calendar className="h-5 w-5" />,
          title: "Year Comparison",
          description: "Compare performance across different years",
          prompt: `📅 Compare the performance across different years (${availableYears.join(', ')}) and identify the best and worst performing periods`
        });
      }
    }

    // Add column-specific prompts
    if (dataContext?.columns.length && dataContext.columns.length > 0) {
      const keyColumns = dataContext.columns.slice(0, 3).join(', ');
      basePrompts.push({
        icon: <Activity className="h-5 w-5" />,
        title: "Column Analysis",
        description: `Focus on key columns: ${keyColumns}`,
        prompt: `🔍 Focus your analysis on these key columns: ${keyColumns}. What insights can you provide about their relationships and patterns?`
      });
    }

    return basePrompts.slice(0, 6);
  };

  const contextualPrompts = getContextualPrompts();

  // Data Status Component
  const DataStatusBadge = () => {
    if (!hasData) return null;

    const dataContext = getDataContext();
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          <Database className="h-3 w-3 mr-1" />
          {dataContext?.rowCount?.toLocaleString()} rows
        </Badge>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <FileText className="h-3 w-3 mr-1" />
          {dataContext?.totalColumns} columns
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {isStockData ? <TrendingUp className="h-3 w-3 mr-1" /> : <PieChart className="h-3 w-3 mr-1" />}
          {dataContext?.dataType}
        </Badge>
        {dataContext?.selectedYear && (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Calendar className="h-3 w-3 mr-1" />
            {dataContext.selectedYear}
          </Badge>
        )}
      </div>
    );
  };


  if (!isMounted) {
    return (
      <div className="h-screen bg-black/20 text-white flex flex-col overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading AI Agent...</p>
          </div>
        </div>
      </div>
    );
  }

  // Transition box component
  const TransitionBox = () => {
    if (!showTransitionBox) return null;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div 
          ref={transitionRef}
          className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
            isTransitioning ? 'top-[calc(100%-8rem)] scale-90' : 'top-1/2 -translate-y-1/2 scale-100'
          }`}
          style={{ width: 'min(768px, 80vw)' }}
        >
          <div className="relative group">
            <Textarea
              value={transitionInput}
              readOnly
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[70px] text-lg rounded-3xl pl-8 pr-24 py-6 transition-all duration-300"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <Button 
                size="sm"
                className="bg-purple-700 text-white rounded-xl h-10 w-10 p-0 transition-all duration-300 shadow-lg"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Welcome screen when no messages
  if ((messages.length === 0 && !fileLoading) || showWelcome) {
    return (
      <>
        <div className="h-screen bg-black/20 text-white flex flex-col overflow-hidden relative">
          {isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="fixed bottom-4 left-20 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-full px-4 py-2 transition-all duration-300 group shadow-lg hover:shadow-xl"
              title="Expand Sidebar"
            >
              <div className="flex items-center gap-2">
                <PanelLeftClose className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              </div>
            </button>
          )}

          {/* Header */}
          <div className={`backdrop-blur-sm sticky top-0 z-10 transition-all duration-800 ${
            isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div className={`mx-auto p-6 transition-all duration-300 ${
              isSidebarCollapsed ? 'max-w-full' : 'max-w-7xl'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Bot className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-white bg-clip-text text-transparent">
                      Anilyst AI Agent
                    </h1>
                    <p className="text-gray-400 text-sm">
                      {hasData 
                        ? `Analyzing ${currentFile?.name} (${currentFile?.rowCount?.toLocaleString()} rows)`
                        : 'Advanced Data Analysis Assistant'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DataStatusBadge />
                  {!hasData && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No Data
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto relative z-10">
            <div className={`w-full text-center space-y-12 transition-all duration-800 ${
              isSidebarCollapsed ? 'max-w-5xl' : 'max-w-4xl'
            } ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
              {/* Welcome Message */}
              <div className="space-y-6">
                <div className="relative">
                  <h1 className="text-5xl font-bold text-white leading-tight">
                    {hasData ? "Let's analyze your data!" : "Ready for data analysis?"}
                  </h1>
                </div>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {hasData 
                    ? `I have complete access to "${currentFile?.name}" with ${currentFile?.rowCount?.toLocaleString()} rows of ${isStockData ? 'stock' : 'general'} data. Ask me anything about patterns, trends, insights, or specific analysis you need.`
                    : "Upload your data first, then I can help you with comprehensive analysis, market insights, statistical analysis, and business intelligence"
                  }
                </p>
              </div>

              {/* Input Area */}
              <div className="relative max-w-3xl mx-auto">
                <div className={`relative group transition-all duration-300 ${
                  showTransitionBox ? 'opacity-0' : 'opacity-100'
                }`}>
                  <Textarea
                    ref={welcomeTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={hasData ? `Ask anything about ${currentFile?.name}...` : "Upload data first, then ask me questions..."}
                    className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[70px] text-lg rounded-3xl pl-8 pr-24 py-6 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:bg-white/10"
                    disabled={isLoading || fileLoading}
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
                      {/* <Mic className="h-5 w-5" /> */}
                    </Button>
                    <Button 
                      onClick={() => handleSend(true)} 
                      disabled={!input.trim() || isLoading || fileLoading}
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-10 w-10 p-0 transition-all duration-300 shadow-lg"
                    >
                      {isLoading || fileLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUp />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Example Prompts Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 transition-all duration-800 delay-200 ${
                isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
              }`}>
                {contextualPrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExamplePrompt(example.prompt)}
                    disabled={!hasData && example.title !== "Upload Data" && example.title !== "Supported Formats" && example.title !== "Analysis Types"}
                    className={`group relative text-left p-6 rounded-2xl transition-all duration-300 border ${
                      !hasData && example.title !== "Upload Data" && example.title !== "Supported Formats" && example.title !== "Analysis Types"
                        ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 backdrop-blur-sm hover:bg-white/10 border-white/10 hover:border-white/20 hover:scale-105 cursor-pointer'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        !hasData && example.title !== "Upload Data" && example.title !== "Supported Formats" && example.title !== "Analysis Types"
                          ? 'bg-gray-500/20 text-gray-500'
                          : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:from-blue-500/30 group-hover:to-purple-500/30'
                      }`}>
                        {example.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 transition-colors ${
                          !hasData && example.title !== "Upload Data" && example.title !== "Supported Formats" && example.title !== "Analysis Types"
                            ? 'text-gray-500'
                            : 'text-white group-hover:text-blue-300'
                        }`}>
                          {example.title}
                        </h3>
                        <p className={`text-sm transition-colors ${
                          !hasData && example.title !== "Upload Data" && example.title !== "Supported Formats" && example.title !== "Analysis Types"
                            ? 'text-gray-600'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
                          {example.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Transition Box */}
        <TransitionBox />
      </>
    );
  }

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden relative">
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-20 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl px-4 py-2 transition-all duration-300 group shadow-lg hover:shadow-xl hidden md:flex"
          title="Expand Sidebar"
        >
          <div className="flex items-center gap-2">
            <PanelLeftOpen className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
          </div>
        </button>
      )}

      {/* Header */}
      <div className="backdrop-blur-sm max-h-20 sticky top-0 z-10 hidden md:block">
        <div className={`mx-auto py-2 px-4 transition-all duration-300 ${
          isSidebarCollapsed ? 'max-w-full' : 'max-w-7xl'
        }`}>
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <DataStatusBadge />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className={`mx-auto space-y-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'max-w-4xl' : 'max-w-3xl'
        }`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                index === 0 ? 'animate-fade-in-up' : ''
              }`}
              style={{ 
                animationDelay: index === 0 ? '400ms' : '0ms',
                animationFillMode: 'both'
              }}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`relative rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100 p-4' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100 p-6'
                }`}>
                  <div className="prose prose-sm max-w-none text-current prose-headings:text-current prose-strong:text-current prose-code:text-current">
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  </div>
                  
                  {/* Only show analysis results for assistant messages - removed data context section */}
                  {message.role === 'assistant' && message.analysis_results && (
                    <div className="mt-4 pt-4">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analysis Complete
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start animate-fade-in-up">
              <Avatar className="w-10 h-10 mt-1">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  <span className="text-sm">
                    {hasData 
                      ? `Analyzing ${currentFile?.name} with ${currentFile?.rowCount?.toLocaleString()} rows...`
                      : 'Processing your request...'
                    }
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-sm p-6 animate-slide-up">
        <div className={`mx-auto relative transition-all duration-300 ${
          isSidebarCollapsed ? 'max-w-4xl' : 'max-w-3xl'
        }`}>
          <div className="relative group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={hasData ? `Ask anything about ${currentFile?.name}...` : "Upload data first using the sidebar button..."}
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[60px] rounded-2xl pl-6 pr-20 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              disabled={isLoading || !hasData || fileLoading}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
                <Mic className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleSend(false)} 
                disabled={!input.trim() || isLoading || !hasData || fileLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-9 w-9 p-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                {isLoading || fileLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 600ms both;
        }
      `}</style>
    </div>
  );
}

const formatUserPrompt = (input: string, hasData: boolean, dataContext: any): string => {
  let prompt = input.trim();
  
  if (hasData && dataContext) {
    prompt += `\n\nCONTEXT: I have uploaded a dataset "${dataContext.fileName}" with ${dataContext.rowCount} rows and these columns: ${dataContext.columns.join(', ')}. Please analyze this data in your response.`;
  } else {
    prompt += `\n\nCONTEXT: I don't have any data uploaded yet. Please provide general guidance and suggest what data I should upload for better analysis.`;
  }
  
  prompt += `\n\nINSTRUCTION: Please provide a clear, direct response without using agent thinking patterns or structured formats. Just give me the analysis and insights directly.`;
  
  return prompt;
};