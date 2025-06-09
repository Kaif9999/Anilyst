"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, User, Send, Trash2, 
  BarChart3, Brain, TrendingUp,
  Loader2, Copy, Check, Mic, MoreHorizontal,
  Sparkles, Database, FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysis_results?: any;
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
    prompt: "🔧 Help me identify and fix data quality issues including outliers, missing values, and inconsistencies"
  }
];

// Animation styles for the blob
const animationStyles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}
`;

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Inject animation styles and handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = animationStyles;
      document.head.appendChild(styleElement);
      
      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.head.removeChild(styleElement);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${FASTAPI_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          data: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const result = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        timestamp: result.timestamp,
        analysis_results: result.analysis_results
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "✨ Response received!",
        description: "AI agent has analyzed your request.",
      });

    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ I apologize, but I encountered an error processing your request. Please check if the backend is running and your API key is configured correctly.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      });
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
    textareaRef.current?.focus();
  };

  // Welcome screen when no messages
  if (messages.length === 0) {
    return (
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden relative">
        {/* Animated Background Blob */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-[20%] left-[15%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob" 
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              transition: 'transform 0.5s ease-out'
            }}
          />
          <div 
            className="absolute top-[50%] right-[20%] w-[28rem] h-[28rem] bg-blue-500/40 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" 
            style={{
              transform: `translate(${-mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
              transition: 'transform 0.5s ease-out',
              animationDelay: '2s'
            }}
          />
          <div className="absolute bottom-[20%] left-[35%] w-[24rem] h-[24rem] bg-pink-500/35 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        {/* Header */}
        <div className="backdrop-blur-sm bg-black/40 border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto p-6">
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
                  <p className="text-gray-400 text-sm">Advanced Data Analysis Assistant</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto relative z-10">
          <div className="max-w-4xl w-full text-center space-y-12">
            {/* Welcome Message */}
            <div className="space-y-6">
              <div className="relative">
                <h1 className="text-5xl font-bold  text-white leading-tight">
                  What's on your mind today?
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                I can help you analyze data, build models, create visualizations, and generate actionable insights for your business
              </p>
            </div>

            {/* Input Area */}
            <div className="relative max-w-3xl mx-auto">
              <div className="relative group">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything about your data analysis..."
                  className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[70px] text-lg rounded-3xl pl-8 pr-24 py-6 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:bg-white/10"
                  disabled={isLoading}
                />
                
                {/* Tools Button */}
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10">
                    <Database className="h-4 w-4 mr-1" />
                    <span className="text-sm">Tools</span>
                  </Button>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isLoading}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-10 w-10 p-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Example Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExamplePrompt(example.prompt)}
                  className="group relative text-left p-6 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                      {example.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {example.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {example.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm mt-8">
              <p>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> to send • <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Shift + Enter</kbd> for new line</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface when messages exist
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden relative">
      {/* Animated Background Blob - smaller for chat mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[10%] right-[10%] w-64 h-64 bg-purple-600/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob" 
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div 
          className="absolute bottom-[15%] left-[15%] w-72 h-72 bg-blue-500/25 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob" 
          style={{
            transform: `translate(${-mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '3s'
          }}
        />
      </div>

      {/* Header */}
      <div className="backdrop-blur-sm bg-black/50 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-lg">Anilyst AI Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-10 h-10 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`relative rounded-3xl p-6 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100'
                }`}>
                  <div className="prose prose-sm max-w-none text-current prose-headings:text-current prose-strong:text-current prose-code:text-current">
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  </div>
                  
                  {/* Analysis Results */}
                  {message.analysis_results && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analysis Complete
                      </Badge>
                    </div>
                  )}
                  
                  {/* Message Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content, index)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-xl"
                    >
                      {copiedMessageId === index.toString() ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="w-10 h-10 mt-1">
                  <AvatarFallback className="bg-gray-700 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-10 h-10 mt-1">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  <span className="text-sm">Analyzing your request...</span>
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
      <div className="backdrop-blur-sm bg-black/20 border-t border-white/10 p-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="relative group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your data analysis..."
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[60px] rounded-2xl pl-6 pr-20 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              disabled={isLoading}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
                <Mic className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-9 w-9 p-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Enter</kbd> to send • 
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs ml-1">Shift + Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}