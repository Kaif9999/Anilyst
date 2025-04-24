"use client";

import { useState, useEffect, useRef } from "react";
import OutputDisplay from "@/components/output-display";
import InputSection, { FileStorageProvider } from "@/components/input-section";
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
  TrendingUp,
  Info,
  Server,
  HelpCircle,
  Upload,
  ArrowRight,
  CheckCircle,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Minimize2,
  MessageCircle,
  DownloadCloud,
  Bot,
  FileUp,
  Monitor,
  Sparkles,
  FileType,
  LayoutDashboard,
  Clock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import VisualizationSidebar from "@/components/VisualizationSidebar";
import { analysisApi } from "@/app/api/fastapi-analysis/analysis-api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

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

type PredictionResult = {
  forecast_values: number[];
  model_metrics: {
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
  };
  seasonality: {
    weekly: number;
    monthly: number;
  };
};

const OnboardingTutorial = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-lg w-[90%] mx-4 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Welcome to Anilyst!</h2>
                <button onClick={onClose} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Step 1: Introduction */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Let's Get Started with Anilyst</h3>
                  </div>
                  <p className="text-sm text-white/80">
                    Anilyst makes data analysis easy for everyone. This quick tour will show you how to:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>Upload and visualize your data</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>Get AI-powered insights automatically</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>Ask questions about your data in plain English</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>Get predictions about future trends</span>
                    </li>
                  </ul>
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <p className="text-blue-300 text-xs">
                      No technical skills required! Anilyst handles all the complex data analysis for you.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 2: Upload Data */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Upload className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Step 1: Upload Your Data</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex-1">
                      <p className="text-white/80 mb-4">
                        To get started, upload your data file using the panel on the right side of the screen.
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-center gap-2 text-white/80">
                          <FileType className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>We support Excel files (.xlsx, .xls)</span>
                        </li>
                        <li className="flex items-center gap-2 text-white/80">
                          <FileType className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>CSV files (.csv)</span>
                        </li>
                        <li className="flex items-center gap-2 text-white/80">
                          <FileType className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>PDF tables (we'll extract the data)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="hidden md:block">
                      <ArrowRight className="w-10 h-10 text-white/40" />
                    </div>
                  </div>
                  <p className="text-white/80">
                    Once you upload your file, we'll automatically process it and show you a visualization. 
                    You don't need to format your data in any special way - we'll figure it out!
                  </p>
                </div>
              )}
              
              {/* Step 3: View Visualization */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <BarChart2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Step 2: Explore Your Visualization</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <h4 className="text-white/90 font-medium mb-2">Charts</h4>
                      <p className="text-white/70 text-sm">
                        Your data will be shown as an interactive chart that you can explore.
                        Hover over data points to see exact values.
                      </p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <h4 className="text-white/90 font-medium mb-2">Customization</h4>
                      <p className="text-white/70 text-sm">
                        You can change chart types, colors, and settings using the controls
                        above the chart.
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Maximize2 className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white/90 font-medium">Full Screen Mode</h4>
                    </div>
                    <p className="text-white/70 text-sm">
                      Click the maximize button to view your chart in full screen mode.
                      This is great for presentations or when you want to focus on the details.
                    </p>
                  </div>
                  <p className="text-white/80">
                    Don't worry about creating the perfect visualization - our AI automatically 
                    chooses the best way to display your data!
                  </p>
                </div>
              )}
              
              {/* Step 4: AI Analysis */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <Brain className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Step 3: Get AI Insights</h3>
                  </div>
                  <p className="text-white/80 mb-4">
                    Once your data is uploaded, our AI will automatically analyze it and provide insights:
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <h4 className="text-white/90 font-medium mb-2">Trends</h4>
                      <p className="text-white/70 text-sm">
                        The AI will identify important patterns and trends in your data.
                      </p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <h4 className="text-white/90 font-medium mb-2">Anomalies</h4>
                      <p className="text-white/70 text-sm">
                        Unusual data points will be detected and highlighted for your attention.
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white/90 font-medium mb-2">Ask Questions</h4>
                    <p className="text-white/70 text-sm">
                      You can ask questions about your data in plain English. For example:
                    </p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li className="text-blue-300 text-sm">"What's the highest value in this data?"</li>
                      <li className="text-blue-300 text-sm">"Show me the trends for the last 3 months"</li>
                      <li className="text-blue-300 text-sm">"What's causing the spike in July?"</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Step 5: Predictions */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-pink-500/20 rounded-full">
                      <TrendingUp className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Step 4: Get Future Predictions</h3>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-white/80">
                      Click the "Predictive Analysis" button to see forecasts for future values
                      based on your historical data.
                    </p>
                    <div className="flex items-center gap-2 bg-purple-500/20 rounded-lg mt-3 p-3">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-white/80 text-sm">Predictive Analysis</span>
                    </div>
                  </div>
                  <p className="text-white/80 mb-4">
                    Our AI will analyze your data patterns and generate predictions for future values.
                    You'll see:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Forecast values for upcoming periods</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Trend direction (up, down, or stable)</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Confidence level of the predictions</span>
                    </li>
                  </ul>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mt-4">
                    <p className="text-blue-300 text-sm">
                      You're now ready to use Anilyst! Remember, you can always access help
                      by clicking the help icon in the top right corner.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    step === 1
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  } transition-colors`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index + 1 === step ? "bg-blue-500" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextStep}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {step === totalSteps ? "Get Started" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

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
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('hasSeenOnboarding', false);
  const [isStatisticalAnalyzing, setIsStatisticalAnalyzing] = useState(false);
  const [statisticalAnalysisResult, setStatisticalAnalysisResult] = useState(null);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Make fullscreen tooltip disappear after 5 seconds
  useEffect(() => {
    if (isFullScreen && showFullscreenTooltip) {
      const timer = setTimeout(() => {
        setShowFullscreenTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    // Reset tooltip visibility when fullscreen mode is toggled
    if (!isFullScreen) {
      setShowFullscreenTooltip(true);
    }
  }, [isFullScreen, showFullscreenTooltip]);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        setHasSeenOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding, setHasSeenOnboarding]);

  // Add keyboard handler for escaping fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

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
      // Call the new FastAPI backend
      const [analysisResult, aiInsights] = await Promise.all([
        analysisApi.analyze(data),
        analysisApi.getAiInsights(data)
      ]);

      setAnalysisResult(analysisResult);
      
      // Save to history using existing Next.js API
      try {
        await fetch("/api/visualizations/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chartData: data,
            analysisResult,
            fileName: "Analysis_" + new Date().toISOString().replace(/:/g, '-'),
            fileType: "visualization",
          }),
        });
      } catch (historyError) {
        console.error("History save error:", historyError);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setPopup({
        show: true,
        message: error instanceof Error ? error.message : "Analysis failed. Please try again.",
      });
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

  // Helper function to check if any trend string contains indicators of statistical significance
  const hasTrend = (trends: string[]): boolean => {
    if (!trends || trends.length === 0) return false;
    
    const significanceKeywords = [
      'significant', 'p-value', 'confidence', 'correlation', 
      'r²', 'r2', 'increasing', 'decreasing', 'strong'
    ];
    
    // Check if any trend contains significance-related keywords
    return trends.some(trend => 
      significanceKeywords.some(keyword => 
        trend.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  const handlePredictiveAnalysis = async () => {
    if (!chartData) {
      setPopup({
        show: true,
        message: "Please upload data first before running predictions",
      });
      return;
    }

    if (!(await checkUsageLimit("analysis"))) return;

    setIsPredicting(true);

    try {
      // Convert the ChartData to the format expected by the API
      const apiCompatibleData = {
        type: 'bar', // Default chart type
        labels: chartData.labels || [],
        datasets: chartData.datasets.map(dataset => ({
          label: dataset.label || '',
          data: dataset.data.map(d => typeof d === 'number' ? d : d.y), // Extract simple numbers
          backgroundColor: Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[0] // Take the first color if it's an array
            : (dataset.backgroundColor as string || '#4F46E5'), // Default to indigo
          borderColor: dataset.borderColor as string,
          fill: true
        }))
      };

      // Call the predictive API
      const result = await analysisApi.getPredictions(apiCompatibleData as any);
      setPredictionResult(result);

      // Format forecast values with 2 decimal places
      const formattedForecasts = result.forecast_values.map((val: number) => val.toFixed(2));
      
      // Calculate percentage increase from last value to predictions
      const currentValues = chartData.datasets[0].data
                            .filter((d): d is number => typeof d === 'number')
                            .slice(-5);
      const lastValue = currentValues[currentValues.length - 1];
      const firstPrediction = result.forecast_values[0];
      const percentChange = lastValue ? ((firstPrediction - lastValue) / lastValue) * 100 : 0;
      
      // Create a detailed prediction message
      const predictionMessage = {
        question: "Can you predict future trends in this data?",
        answer: `📊 **Prediction Results**

Based on the historical data patterns, I've generated predictions for future values:

**Forecast Values:**
${formattedForecasts.map((val: string, i: number) => `• Period ${i+1}: ${val}`).join('\n')}

**Trend Direction:** ${percentChange > 0 ? '📈 Upward' : percentChange < 0 ? '📉 Downward' : '➡️ Stable'}
${percentChange !== 0 ? `(${Math.abs(percentChange).toFixed(2)}% ${percentChange > 0 ? 'increase' : 'decrease'} predicted)` : ''}

**Model Confidence:** ${(result.model_metrics.r2 * 100).toFixed(1)}%

**Key Insights:**
• Seasonal patterns: ${result.seasonality.weekly > 0.5 ? 'Strong weekly cycles detected' : 'No significant weekly patterns'}
• Data quality: Model performed with ${(result.model_metrics.mae < 0.2 ? 'high' : result.model_metrics.mae < 0.5 ? 'moderate' : 'low')} accuracy
• Prediction reliability: ${result.model_metrics.r2 > 0.7 ? 'High confidence in these predictions' : result.model_metrics.r2 > 0.4 ? 'Moderate confidence in these predictions' : 'These predictions should be treated as estimates only'}

**Recommendations:**
• ${result.model_metrics.r2 < 0.4 ? 'Consider adding more historical data for better predictions' : 'Continue monitoring to validate prediction accuracy'}
• Use these insights for preliminary planning, but verify with domain expertise
• ${result.seasonality.monthly > 0.5 ? 'Consider monthly trends when making decisions' : 'Focus on immediate trend direction for decision-making'}`
      };
      
      setChatHistory(prev => [...prev, predictionMessage]);
    } catch (error) {
      console.error("Prediction failed:", error);
      setPopup({
        show: true,
        message: error instanceof Error ? error.message : "Prediction failed. Please try again.",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleStatisticalAnalysis = async () => {
    if (!chartData) {
      setPopup({
        show: true,
        message: "Please upload data first before running statistical analysis",
      });
      return;
    }

    if (!(await checkUsageLimit("analysis"))) return;

    setIsStatisticalAnalyzing(true);

    try {
      // Convert the ChartData to the format expected by the API 
      // Using the same format as predictive analysis for consistency
      const apiCompatibleData = {
        type: 'bar', // Default chart type
        labels: chartData.labels || [],
        datasets: chartData.datasets.map(dataset => ({
          label: dataset.label || '',
          data: dataset.data.map(d => typeof d === 'number' ? d : d.y), // Extract simple numbers
          backgroundColor: Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[0] // Take the first color if it's an array
            : (dataset.backgroundColor as string || '#4F46E5'), // Default to indigo
          borderColor: dataset.borderColor as string,
          fill: true
        }))
      };

      // Call the statistical analysis API with fallback logic
      let result;
      try {
        // First try to use the statistical-analysis endpoint
        result = await analysisApi.getStatisticalAnalysis(apiCompatibleData as any);
        console.log("Successfully used statistical-analysis endpoint");
      } catch (apiError) {
        console.error("Statistical analysis API call failed:", apiError);
        
        // If the statistical-analysis endpoint fails, try the analyze endpoint as a fallback
        try {
          console.warn("Falling back to analyze endpoint");
          result = await analysisApi.analyze(apiCompatibleData as any);
          console.log("Successfully used analyze endpoint as a fallback");
        } catch (fallbackError) {
          console.error("Fallback to analyze failed:", fallbackError);
          setPopup({
            show: true,
            message: "Statistical analysis failed. The backend service may be unavailable.",
          });
          return;
        }
      }
      
      // Store the result in statisticalAnalysisResult state
      setStatisticalAnalysisResult(result);
      
      // Also update the analysisResult state which is used by the UI
      setAnalysisResult(result);
      
      // Check if the backend already provides a nicely formatted response
      if (result?.insights?.queryResponse?.answer && 
          result.insights.queryResponse.answer.trim().startsWith("📊")) {
        
        // Use the backend-formatted response
        const backendFormattedMessage = {
          question: "Can you perform a statistical analysis on this data?",
          answer: result.insights.queryResponse.answer
        };
        
        setChatHistory(prev => [...prev, backendFormattedMessage]);
      } else {
        // Create our own formatted message as fallback
        const datasetName = chartData.datasets[0]?.label || "Dataset";
        
        // Extract key statistics and ensure they exist with default values if missing
        const statistics = result?.insights?.statistics || { mean: 0, median: 0, mode: 0, outliers: [] };
        const trends = result?.insights?.trends || [];
        const anomalies = result?.insights?.anomalies || [];
        const correlations = result?.insights?.correlations || [];
        const recommendations = result?.recommendations || [];
        
        // Format the message with emoji and sections
        const statisticalMessage = {
          question: "Can you perform a statistical analysis on this data?",
          answer: `📊 **Statistical Analysis Results**

Based on a comprehensive analysis of the ${datasetName} data:

**Key Statistics:**
• 📏 Mean: ${typeof statistics.mean === 'number' ? statistics.mean.toFixed(2) : 'N/A'}
• 📊 Median: ${typeof statistics.median === 'number' ? statistics.median.toFixed(2) : 'N/A'}
${statistics.outliers && statistics.outliers.length > 0 ? `• ⚠️ Outliers detected: ${statistics.outliers.length}` : '• ✅ No significant outliers detected'} 

**Trend Analysis:**
${trends.length > 0 
  ? trends.map((trend: string) => `• 📈 ${trend}`).join('\n') 
  : '• ➖ No significant trends detected in the dataset'}

**Anomaly Detection:**
${anomalies.length > 0 
  ? anomalies.map((anomaly: string) => `• 🔍 ${anomaly}`).join('\n') 
  : '• ✅ No significant anomalies detected in the dataset'}

**Correlation Analysis:**
${correlations.length > 0 
  ? correlations.map((corr: any) => {
      // Add emoji based on correlation strength
      let correlationEmoji = '➖'; // neutral by default
      if (corr.strength > 0.7) correlationEmoji = '🔵'; // strong positive
      else if (corr.strength > 0.3) correlationEmoji = '🟢'; // moderate positive
      
      return `• ${correlationEmoji} ${corr.variables[0]} & ${corr.variables[1]}: ${corr.description} (${(corr.strength * 100).toFixed(1)}%)`;
    }).join('\n') 
  : '• ℹ️ No significant correlations found between variables'}

**Statistical Confidence:**
• ${hasTrend(trends) ? '✅ Statistically significant trends identified' : '❓ No statistically significant trends found'} 
• ${statistics.outliers && statistics.outliers.length > 0 ? '⚠️ Data contains potential outliers that may affect results' : '✅ Data appears free of significant outliers'}
• ${correlations.length > 0 ? `🔍 ${correlations.length} correlation patterns identified` : '➖ No correlation patterns identified'}

**Recommendations:**
${recommendations.length > 0
  ? recommendations.map((rec: string, i: number) => `• 💡 ${rec}`).join('\n')
  : '• ℹ️ No specific recommendations available for this dataset'}

${result?.insights?.queryResponse?.answer ? '\n**Additional Insights:**\n' + result.insights.queryResponse.answer.split('**1. Direct Answer:**')[1]?.trim() || '' : ''}`
        };
        
        setChatHistory(prev => [...prev, statisticalMessage]);
      }

      // Save to history using existing Next.js API
      try {
        await fetch("/api/visualizations/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chartData: chartData,
            analysisResult: result,
            fileName: "StatisticalAnalysis_" + new Date().toISOString().replace(/:/g, '-'),
            fileType: "statisticalAnalysis",
          }),
        });
      } catch (historyError) {
        console.error("History save error:", historyError);
      }
    } catch (error) {
      console.error("Statistical analysis failed:", error);
      setPopup({
        show: true,
        message: error instanceof Error ? error.message : "Statistical analysis failed. Please try again.",
      });
    } finally {
      setIsStatisticalAnalyzing(false);
    }
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  return (
    <TooltipProvider>
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
          {/* Main Header Bar - Contains branding, title and controls */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10 py-4 px-6">
            <div className="container mx-auto flex items-center justify-between">
              {/* Left - Branding and Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Anilyst Data Dashboard</h1>
                  <p className="text-xs text-white/60">AI-powered data analysis platform</p>
                </div>
              </div>
              
              {/* Right - Controls */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white rounded-xl hover:bg-blue-700 transition-colors border border-blue-700/30"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </button>
                
                {!isFullScreen && (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-xl hover:bg-white/20 hover:text-red-400 transition-colors border border-white/10 z-30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Popup Message */}
          <div
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-8000 ${
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
            <section className="relative z-10 pt-24 pb-20 flex-grow">
              <div className="container mx-auto px-4">
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
                              data={chartData}
                              title="Data Visualization"
                              onFullScreen={() => setIsFullScreen(true)}
                              predictionResult={predictionResult || undefined}
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
                          {/* Analysis Panel Header */}
                          <div className="p-4 border-b border-white/10 bg-black/30">
                            <h2 className="text-xl font-bold text-white flex items-center">
                              <Brain className="mr-2 h-5 w-5 text-purple-400" />
                              AI Analysis & Chat
                            </h2>
                            <p className="text-white/60 text-sm mt-1">
                              View insights and ask questions about your data
                            </p>
                          </div>

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

                          {/* Chat Input Section with Predictive Analysis - Moved to bottom */}
                          <div className="p-4 border-t border-white/10 bg-black/20 sticky bottom-0">
                            <div className="flex gap-2 mb-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={handlePredictiveAnalysis}
                                      disabled={!chartData || isPredicting || isAnalyzing}
                                      className={`flex items-center gap-2 py-2 px-4 rounded-lg ${
                                        isPredicting
                                          ? "bg-purple-600/50 cursor-not-allowed"
                                          : "bg-purple-600 hover:bg-purple-700"
                                      } transition-colors`}
                                    >
                                      <TrendingUp className="w-4 h-4" />
                                      <span>
                                        {isPredicting ? "Forecasting..." : "Predictive Analysis"}
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs bg-black/90 border-white/10">
                                    <div className="p-1 text-sm">
                                      <p className="font-medium text-white mb-1">Python-Powered Forecasting</p>
                                      <p className="text-white/80 text-xs">
                                        This feature uses our FastAPI backend to generate time-series forecasts using statistical models. 
                                        The Python engine calculates predictions, confidence intervals, and seasonality metrics.
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={handleStatisticalAnalysis}
                                      disabled={!chartData || isStatisticalAnalyzing || isAnalyzing}
                                      className={`flex items-center gap-2 py-2 px-4 rounded-lg ${
                                        isStatisticalAnalyzing
                                          ? "bg-blue-600/50 cursor-not-allowed"
                                          : "bg-blue-600 hover:bg-blue-700"
                                      } transition-colors`}
                                    >
                                      <BarChart2 className="w-4 h-4" />
                                      <span>
                                        {isStatisticalAnalyzing ? "Analyzing..." : "Statistical Analysis"}
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs bg-black/90 border-white/10">
                                    <div className="p-1 text-sm">
                                      <p className="font-medium text-white mb-1">Advanced Statistical Analysis</p>
                                      <p className="text-white/80 text-xs">
                                        Run in-depth statistical tests on your data to identify patterns, correlations,
                                        and significant features. This uses our Python-powered backend for advanced analytics.
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
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
                      <FileStorageProvider>
                        <InputSection onResultReceived={handleDataAnalysis} />
                      </FileStorageProvider>
                    </motion.div>
                  </div>
                </div>

                {/* Full Screen Modal */}
                <AnimatePresence mode="wait">
                  {isFullScreen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg overflow-hidden flex flex-col"
                    >
                      <div className="sticky top-0 flex items-center justify-between p-4 bg-black/60 border-b border-white/10 z-[201]">
                        <h2 className="text-xl font-bold text-white ml-4 flex items-center">
                          <BarChart2 className="mr-2 h-5 w-5 text-blue-400" />
                          Data Visualization
                        </h2>
                        <button
                          onClick={() => setIsFullScreen(false)}
                          className="p-2.5 rounded-full bg-red-500/70 hover:bg-red-600 text-white transition-colors shadow-lg border border-red-400/30"
                          aria-label="Close fullscreen view"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        <div className="w-full h-full max-h-[calc(100vh-8rem)] flex items-center justify-center">
                          {chartData && (
                            <div className="w-full h-full relative">
                              {/* Add a help tooltip to indicate how to exit fullscreen that disappears after 5 seconds */}
                              {showFullscreenTooltip && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 text-white/90 text-sm flex items-center gap-2 pointer-events-none shadow-lg animate-pulse"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                  <span>Click any red X button to exit fullscreen mode</span>
                                </motion.div>
                              )}
                              
                              <OutputDisplay
                                data={chartData}
                                title=""
                                isFullScreen={true}
                                onClose={() => setIsFullScreen(false)}
                                predictionResult={predictionResult || undefined}
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

        {/* Onboarding Tutorial */}
        <OnboardingTutorial isOpen={showOnboarding} onClose={closeOnboarding} />
      </div>
    </TooltipProvider>
  );
}
