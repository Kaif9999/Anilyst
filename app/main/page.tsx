"use client";

import { useState, useEffect } from "react";
import OutputDisplay from "@/components/output-display";
import InputSection from "@/components/input-section";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import { ChartData, AnalyticsResult } from "@/types";
import StarryBackground from "@/components/starry-background";
import {
  LogOut,
  Brain,
  Menu,
  X,
  ArrowDown,
  BarChart2,
  Send,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import VisualizationSidebar from "@/components/VisualizationSidebar";

interface AnalysisState {
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
  recommendations: string[];
  chatHistory: { question: string; answer: string }[];
}

export default function Home() {
  const { data: session } = useSession();
  const [popup, setPopup] = useState<{ show: boolean; message: string }>({
    show: false,
    message:
      "You have exhausted your quota. Please upgrade to Pro for unlimited access.",
  });

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisState | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const checkUsageLimit = async (type: "visualization" | "analysis") => {
    if (!session) {
      setPopup({
        show: true,
        message: "Please sign in to continue.",
      });
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
      return false;
    }

    try {
      const response = await fetch("/api/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          const message =
            type === "visualization"
              ? "You've used all 5 visualizations. Upgrade to Pro for unlimited charts and insights!"
              : "You've used all 5 analyses. Upgrade to Pro for unlimited AI-powered analysis!";
          setPopup({
            show: true,
            message: message,
          });
          setTimeout(() => {
            window.location.href = "/pricing";
          }, 9000);
        } else {
          setPopup({
            show: true,
            message: "An error occurred while checking usage limits.",
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Usage check failed:", error);
      setPopup({
        show: true,
        message: "An error occurred while checking usage limits.",
      });
      return false;
    }
  };

  const handleDataAnalysis = async (data: ChartData) => {
    if (!(await checkUsageLimit("visualization"))) return;

    setChartData(data);
    setIsAnalyzing(true);

    try {
      // Store the visualization and analysis results
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          fileName: "Analysis " + new Date().toLocaleString(),
          fileType: "visualization",
          content: JSON.stringify({
            chartData: data,
            timestamp: new Date().toISOString(),
          }),
        }),
      });

      const result = await response.json();
      setAnalysisResult(result);
      await fetch("/api/visualizations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartData: data,
          analysisResult: result,
          fileName: "Analysis " + new Date().toLocaleString(),
          fileType: "visualization",
        }),
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!(await checkUsageLimit("analysis"))) return;

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          data: chartData,
          context: analysisResult,
        }),
      });

      const result = await response.json();

      if (result.insights?.queryResponse) {
        const newQA = {
          question: result.insights.queryResponse.question,
          answer: result.insights.queryResponse.answer,
        };
        setChatHistory((prev) => [...prev, newQA]);
      }

      setAnalysisResult(result);
    } catch (error) {
      console.error("Query failed:", error);
    } finally {
      setQuery(""); // Clears the input field after sending
    }
  };

  const handleNewSession = () => {
    // Reset current state for new session
    setChartData(null);
    setAnalysisResult({
      insights: {
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
      },
      recommendations: [],
      chatHistory: [],
    });
    setChatHistory([]);
    setQuery("");
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      setPopup({ show: true, message: "Loading session..." });

      const response = await fetch(`/api/visualizations/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to load session");
      }

      const data = await response.json();

      // Update all relevant state with the session data
      if (data.chartData) {
        setChartData(data.chartData);
      }

      if (data.analysisResult) {
        setAnalysisResult(data.analysisResult);
      }

      if (data.chatHistory) {
        setChatHistory(data.chatHistory);
      }

      setPopup({ show: false, message: "" });
    } catch (error) {
      console.error("Failed to load session:", error);
      setPopup({
        show: true,
        message: "Failed to load session. Please try again.",
      });

      setTimeout(() => {
        setPopup({ show: false, message: "" });
      }, 3000);
    }
  };

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      <VisualizationSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
      />

      {/* Adjust main content padding when sidebar is open */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "pl-[280px]" : "pl-0"
        }`}
      >
        {/* Sign Out Button - Fixed Position */}
        {!isFullScreen && (
          <div className="fixed top-6 right-6 z-20">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-xl hover:bg-white/20 hover:text-red-400 transition-colors border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Popup Message */}
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-8000 ${
            popup.show
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl px-6 py-4 shadow-lg min-w-[300px]">
            <p className="text-white text-center font-medium">
              {popup.message}
            </p>
          </div>
        </div>

        {/* Animated gradient background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
          <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
          <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
        </div>

        <StarryBackground />

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
        >
          <div className="p-6">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6 hover:text-red-500" />
            </button>
            <div className="flex flex-col space-y-8 mt-16">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="font-semibold hover:bg-red-500 transition-colors block w-full py-3 text-center text-xl bg-white text-black hover:bg-white/90 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-screen flex flex-col">
          <section className="relative z-10 pt-20 pb-20 flex-grow">
            <div className="container mx-auto px-4">
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Data Analysis Dashboard
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Visualize and analyze your data with AI
                </p>
              </motion.div>

              {/* Main Content Area - 75/25 Split Layout */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Column - 75% - Chart Visualization and AI Analysis */}
                <div className="w-full lg:w-3/4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8 h-full space-y-6"
                  >
                    {/* Main Chart */}
                    {chartData ? (
                      <div className="w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10">
                        <div className="min-h-[600px] h-full w-full">
                          <OutputDisplay
                            chartData={chartData}
                            onFullScreen={() => setIsFullScreen(true)}
                          />
                        </div>
                      </div>
                    ) : (
                      // Placeholder when no data
                      <div className="flex flex-col items-center justify-center py-20 text-white/60">
                        <BarChart2 className="w-16 h-16 mb-4 opacity-40" />
                        <p className="text-lg">
                          Upload a CSV file to visualize your data
                        </p>
                      </div>
                    )}

                    {/* Merged AI Chat Input and Analysis Panel */}
                    {chartData && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
                      >
                        {/* Analysis Results */}
                        <div className="flex-grow overflow-y-auto">
                          {analysisResult && (
                            <div className="p-6">
                              <AIAnalysisPanel
                                insights={analysisResult.insights}
                                recommendations={analysisResult.recommendations}
                                chatHistory={chatHistory}
                              />
                            </div>
                          )}
                        </div>

                        {/* Chat Input Section - Moved to bottom */}
                        <div className="p-4 border-t border-white/10 bg-black/20 sticky bottom-0">
                          <form onSubmit={handleQuery} className="space-y-4">
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask questions about your data analysis..."
                                className="w-full bg-white/5 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pr-12"
                              />
                              <button
                                type="submit"
                                className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Right Column - 25% - Input Section */}
                <div className="w-full lg:w-1/4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full"
                  >
                    <InputSection onResultReceived={handleDataAnalysis} />
                  </motion.div>
                </div>
              </div>

              {/* Full Screen Modal */}
              <AnimatePresence>
                {isFullScreen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg overflow-hidden flex flex-col"
                  >
                    <div className="top-0 flex justify-end p-4 bg-black/40 border-b border-white/10 z-50">
                      <button
                        onClick={() => setIsFullScreen(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <div className="w-full h-full max-h-[calc(100vh-8rem)] flex items-center justify-center">
                        {chartData && (
                          <div className="w-full h-full">
                            <OutputDisplay
                              chartData={chartData}
                              isFullScreen={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
