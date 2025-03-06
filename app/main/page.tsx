"use client";

import { useState, useEffect } from "react";
import OutputDisplay from "@/components/output-display";
import InputSection from "@/components/input-section";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import { ChartData, AnalyticsResult } from "@/types";
import Popup from "@/components/alertpopup";
import StarryBackground from "@/components/starry-background";
import {
  LogOut,
  Brain,
  Menu,
  X,
  ArrowDown,
  BarChart2,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyticsResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string }[]
  >([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [popup, setPopup] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });


  const checkUsageLimit = async (type: 'visualization' | 'analysis') => {
    if (!session) {
      setPopup({
        show: true,
        message: 'Please sign in to continue.'
      });
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return false;
    }

    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          setPopup({
            show: true,
            message: data.error || `You've reached your ${type} limit. Please upgrade to Pro for unlimited access.`
          });
          setTimeout(() => {
            window.location.href = '/pricing';
          }, 2000);
        } else {
          setPopup({
            show: true,
            message: 'An error occurred while checking usage limits.'
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Usage check failed:', error);
      setPopup({
        show: true,
        message: 'An error occurred while checking usage limits.'
      });
      return false;
    }
  };

  const handleDataAnalysis = async (data: ChartData) => {
    if (!await checkUsageLimit('visualization')) return;

    setChartData(data);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!await checkUsageLimit('analysis')) return;

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
      setQuery(""); // ✅ Clears the input field after sending
    }
  };

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <StarryBackground />
      {/* Popup */}
      {popup.show && (
        <Popup 
          message={popup.message} 
          onClose={() => setPopup({ show: false, message: "" })} 
        />
      )}

      {/* Navbar */}
      <nav
        className={`fixed py-8 top-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-50 transition-all duration-300 ${
          isScrolled ? "py-2 scale-95" : "md:top-2"
        }`}
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white">
                  Anilyst
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-10">
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#features"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white/80 rounded-xl hover:bg-white/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

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
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b-2 text-2xl font-semibold text-white hover:text-blue-400 transition-colors pb-4"
            >
              Pricing
            </Link>
            <div className="pt-40">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className=" font-semibold hover:bg-red-500 transition-colors block w-full py-3 text-center text-xl bg-white text-black hover:bg-white/90 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        <section className="relative z-10 pt-32 pb-20 flex-grow">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl pt-6 md:text-5xl font-bold text-white mb-4">
                Data Analysis Dashboard
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Visualize and analyze your data with AI
              </p>
            </motion.div>

            {/* Visualization Section */}
            <div className="mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
              >
                {chartData ? (
                  <div className="space-y-12">
                    {/* Main Chart */}
                    <div className="w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6">
                      <div className="min-h-[600px] h-full w-full">
                        <OutputDisplay chartData={chartData} />
                      </div>
                    </div>

                    {/* AI Analysis Panel */}
                    {analysisResult && (
                      <AIAnalysisPanel
                        insights={analysisResult.insights}
                        recommendations={analysisResult.recommendations}
                        chatHistory={chatHistory}
                      />
                    )}
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
              </motion.div>
            </div>

            {/* Input Section - Now Below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto space-y-8 mt-8"
            >
              {/* Question Input Section */}
              {chartData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Ask Questions About Your Data
                  </h2>
                  <form onSubmit={handleQuery} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question about your data..."
                        className="w-full bg-black/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* CSV Upload Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Upload Data can be .csv file
                </h2>
                <InputSection onResultReceived={handleDataAnalysis} />
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
