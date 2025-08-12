"use client";

import { useState, useEffect } from "react";
import OutputDisplay from "@/components/output-display";
import { ChartData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  Maximize2,
  Upload,
  FileText,
  Download,
  Share2,
  Settings,
  Palette,
  RotateCcw,
  Eye,
  Zap,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useFileStore } from '@/store/file-store';

export default function VisualizationPage() {
  const { data: session } = useSession();
  const [popup, setPopup] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // Get data from file store
  const { currentFile, chartData: storedChartData, hasData } = useFileStore();

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data from store on component mount
  useEffect(() => {
    if (storedChartData) {
      setIsProcessing(true);
      setTimeout(() => {
        setChartData(storedChartData);
        setIsProcessing(false);
      }, 800); // Add a slight delay for smooth experience
    }
  }, [storedChartData]);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

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

  const handleDownload = async () => {
    if (!chartData) return;
    
    // Simulate download action
    setPopup({
      show: true,
      message: "Chart downloaded successfully! 📊",
    });
  };

  const handleShare = async () => {
    if (!chartData) return;
    
    // Simulate share action
    setPopup({
      show: true,
      message: "Share link copied to clipboard! 🔗",
    });
  };

  const refreshVisualization = () => {
    if (!storedChartData) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setChartData({ ...storedChartData });
      setIsProcessing(false);
      setPopup({
        show: true,
        message: "Visualization refreshed! ✨",
      });
    }, 600);
  };

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Popup Message */}
      <div
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
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
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-blue-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-indigo-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse animation-delay-3000"></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col relative z-10">
        <section className="pt-8 pb-20 flex-grow">
          <div className="container mx-auto px-4">
            {/* Modern Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                    Data Visualization
                  </h1>
                  <p className="text-white/60 text-lg">
                    {currentFile 
                      ? `✨ ${currentFile.name} • ${currentFile.rowCount} rows`
                      : "Transform your data into beautiful, interactive charts"
                    }
                  </p>
                </div>
                
                {/* Action Buttons */}
                {chartData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={refreshVisualization}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 text-white backdrop-blur-sm group"
                    >
                      <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Refresh</span>
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 rounded-xl transition-all duration-300 text-white group"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-500/50 rounded-xl transition-all duration-300 text-white group"
                    >
                      <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Share</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {/* Empty State */}
              {!hasData() && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden"
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Upload className="w-12 h-12 text-white/60" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3">Ready to Visualize?</h2>
                    <p className="text-white/60 mb-6 text-lg max-w-md mx-auto">
                      Upload your data from the sidebar and watch it transform into stunning, interactive visualizations
                    </p>
                    
                    <div className="flex items-center justify-center space-x-6 text-sm text-white/50">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>CSV & Excel</span>
                      </div>
                      <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Real-time Preview</span>
                      </div>
                      <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Instant Charts</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Processing State */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8 text-center"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animation-delay-500"></div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">Creating your visualization...</p>
                      <p className="text-sm text-white/60">This will just take a moment ✨</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Visualization Section */}
              {chartData && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden relative"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-white/10 bg-black/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <BarChart2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Interactive Chart</h3>
                          <p className="text-white/60 text-sm">Powered by advanced visualization engine</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setIsFullScreen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 text-white group"
                      >
                        <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span>Fullscreen</span>
                      </button>
                    </div>
                  </div>

                  {/* Chart Display */}
                  <div className="p-6">
                    <div className="w-full bg-gray-900 rounded-xl border border-gray-800">
                      <div className="min-h-[600px] h-full w-full relative">
                        <div className="w-full h-full">
                          <OutputDisplay
                            data={chartData}
                            title=""
                            onFullScreen={() => setIsFullScreen(true)}
                          />
                        </div>
                        
                        {/* Floating action hint */}
                        <div className="absolute top-4 right-4 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 z-10">
                          <p className="text-xs text-white/70 flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Hover to interact
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">
                          {chartData.datasets.length}
                        </div>
                        <div className="text-sm text-white/60">Data Series</div>
                      </div>
                      
                      <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400">
                          {chartData.labels?.length || 0}
                        </div>
                        <div className="text-sm text-white/60">Data Points</div>
                      </div>
                      
                      <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">
                          100%
                        </div>
                        <div className="text-sm text-white/60">Interactive</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence mode="wait">
              {isFullScreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg overflow-hidden flex flex-col"
                >
                  {/* Fullscreen Header */}
                  <div className="sticky top-0 flex items-center justify-between p-6 bg-black/60 border-b border-white/10 z-[201] backdrop-blur-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Fullscreen Visualization</h2>
                        <p className="text-white/60 text-sm">{currentFile?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDownload}
                        className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-colors text-blue-400"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setIsFullScreen(false)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-colors text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Fullscreen Content */}
                  <div className="flex-1 overflow-auto p-6">
                    <div className="w-full h-full min-h-[calc(100vh-8rem)] flex items-center justify-center">
                      {chartData && (
                        <div className="w-full h-full relative max-w-full overflow-hidden">
                          <OutputDisplay
                            data={chartData}
                            title=""
                            isFullScreen={true}
                            onClose={() => setIsFullScreen(false)}
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
  );
}