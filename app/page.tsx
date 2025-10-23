"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  BarChart2,
  PieChart,
  LineChart,
  Brain,
  Sparkles,
  ArrowRight,
  Code,
  Cpu,
  GitBranch,
  Terminal,
  Clock,
  Server,
  TrendingUp,
  BarChart,
  FileType,
  FileSpreadsheet,
  MessageSquare,
  Heart,
  DollarSign,
  Zap,
  CheckCircle,
  HelpCircle,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Custom animation styles
const animationStyles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float-slow {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes float-medium {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(-5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes ping-slow {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(0.8); opacity: 0; }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 6s ease-in-out infinite;
}

.animate-ping-slow {
  animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-3000 {
  animation-delay: 3s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animation-delay-5000 {
  animation-delay: 5s;
}
`;

// Feature data
const mainFeatures = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Smart Data Analysis",
    description:
      "Just upload your data and let our AI do the hard work - no coding or complex setup required",
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: "Simple Questions, Smart Answers",
    description: "Ask questions about your data in plain English and get clear, easy-to-understand insights",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Future Predictions",
    description: "See what's coming next with reliable forecasts based on your historical data",
  },
  {
    icon: <FileType className="w-6 h-6" />,
    title: "Works With Your Files",
    description: "Just drag and drop your Excel, CSV or PDF files - we handle all the technical details",
  },
];

// Advanced features coming soon
const advancedFeatures = [
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "Version Control",
    description: "Track changes and collaborate with your team seamlessly",
    comingsoon: "Coming Soon",
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Custom Scripts",
    description: "Write custom analysis scripts in Python or R",
    comingsoon: "Coming Soon",
  },
];

// Feature sections data with expanded explanations
const featureSections = [
  {
    title: "Data Processing",
    description:
      "Process large datasets efficiently with our distributed computing engine. Our system handles millions of data points in seconds, giving you quick insights without technical complexity.",
    features: [
      "Automatic data cleaning and preprocessing",
      "Support for CSV, Excel, and PDF formats",
      "Real-time data streaming and processing",
      "Custom data transformations with no coding required"
    ],
    icon: <FileSpreadsheet className="w-10 h-10 text-blue-400" />,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    color: "from-blue-600/20 to-blue-700/20",
    hoverColor: "group-hover:from-blue-600/40 group-hover:to-blue-700/40"
  },
  {
    title: "Advanced Visualization",
    description:
      "Create beautiful, interactive visualizations that tell your data's story. Our intelligent system automatically selects the most appropriate chart types based on your data structure.",
    features: [
      "Interactive dashboards with 8+ chart types",
      "Downloadable charts and raw data exports",
      "Full-screen presentation mode for meetings",
      "Customizable colors, labels, and display options"
    ],
    icon: <BarChart2 className="w-10 h-10 text-green-400" />,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    color: "from-green-600/20 to-green-700/20",
    hoverColor: "group-hover:from-green-600/40 group-hover:to-green-700/40"
  },
  {
    title: "AI Integration",
    description:
      "Leverage advanced AI capabilities for deeper insights. Our ML algorithms automatically detect patterns, anomalies, and correlations that would be impossible to spot manually.",
    features: [
      "Time-series forecasting with machine learning",
      "Anomaly detection using statistical models",
      "Pattern recognition with AI algorithms",
      "Automated reporting and insights generation"
    ],
    icon: <Brain className="w-10 h-10 text-purple-400" />,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop",
    color: "from-purple-600/20 to-purple-700/20",
    hoverColor: "group-hover:from-purple-600/40 group-hover:to-purple-700/40"
  },
];

// Architecture section data
const architectureComponents = [
  {
    icon: <BarChart className="w-6 h-6 text-blue-400" />,
    title: "Next.js Frontend",
    description: "Responsive UI built with Next.js and TailwindCSS for beautiful visualizations"
  },
  {
    icon: <Server className="w-6 h-6 text-green-400" />,
    title: "FastAPI Backend",
    description: "Dedicated Python analytics engine for advanced statistical processing and ML predictions"
  },
  {
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    title: "AI Models",
    description: "Combination of OpenAI's language models and custom predictive analytics algorithms"
  }
];

// How It Works section data
const howItWorksSteps = [
  {
    step: 1,
    title: "Upload Your Data",
    description: "Upload your spreadsheet file with just a drag and drop. We support Excel (.xlsx, .xls), CSV files, and even extract tables from PDFs. Your data stays secure and is processed in the browser for privacy.",
    icon: <FileSpreadsheet className="w-8 h-8 text-blue-400" />,
    details: [
      "Automatic column and data type detection",
      "Handles dates, numbers, and text formats",
      "In-memory processing for privacy"
    ]
  },
  {
    step: 2,
    title: "Instant Visualization",
    description: "Your data is automatically analyzed and transformed into beautiful, interactive charts and graphs. We intelligently choose the best visualization type based on your data structure.",
    icon: <BarChart2 className="w-8 h-8 text-green-400" />,
    details: [
      "Bar, line, scatter, and pie charts",
      "Interactive tooltips and zoom features",
      "Customizable colors and display options"
    ]
  },
  {
    step: 3,
    title: "AI-Powered Insights",
    description: "Our powerful AI analyzes your data to uncover patterns, trends, anomalies, and correlations you might miss. Get statistical analysis and predictions without writing a single line of code.",
    icon: <Brain className="w-8 h-8 text-purple-400" />,
    details: [
      "Automatic trend detection",
      "Outlier identification",
      "Time-series forecasting"
    ]
  },
  {
    step: 4,
    title: "Ask Questions in Plain English",
    description: "Simply type questions about your data in everyday language. Our AI understands context and can answer complex analytical questions without requiring technical knowledge of databases or statistics.",
    icon: <MessageSquare className="w-8 h-8 text-yellow-400" />,
    details: [
      "Natural language processing",
      "Context-aware responses",
      "Follow-up questions supported"
    ]
  },
];

// Add use cases section with expanded details and image URLs
const useCases = [
  {
    title: "Business Reporting",
    description: "Turn sales data into clear insights without spending hours in spreadsheets. Perfect for marketing teams, sales managers, and business analysts who need to quickly understand performance metrics and customer trends.",
    icon: <BarChart className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    features: [
      "Create professional reports in minutes",
      "Track KPIs and performance trends",
      "Share interactive dashboards with stakeholders"
    ]
  },
  {
    title: "Financial Analysis",
    description: "Understand market trends and make data-driven investment decisions. Ideal for financial analysts, investors, and anyone tracking financial performance who needs to identify patterns and forecast future outcomes.",
    icon: <DollarSign className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    features: [
      "Analyze stock price movements and patterns",
      "Forecast financial performance",
      "Identify market trends and correlations"
    ]
  },

];

// Update userFriendlyArchitecture with more details and hover effects
const userFriendlyArchitecture = [
  {
    icon: <BarChart className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />,
    title: "Easy-to-Use Interface",
    description: "A beautiful, simple dashboard that makes data analysis accessible to everyone",
    detailedDescription: "Our intuitive interface guides you through each step of the analysis process with clear, actionable controls and contextual help.",
    color: "from-blue-600/20 to-blue-700/20 group-hover:from-blue-600/40 group-hover:to-blue-700/40",
    iconBg: "group-hover:bg-blue-500/20",
    highlightPoints: [
      "Drag-and-drop file upload",
      "One-click visualizations",
      "Guided analysis workflow"
    ]
  },
  {
    icon: <Server className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" />,
    title: "Powerful Analysis Engine",
    description: "Our behind-the-scenes technology handles complex calculations so you don't have to",
    detailedDescription: "Built on FastAPI and Python, our analysis engine processes millions of data points in seconds using advanced statistical algorithms and machine learning models.",
    color: "from-green-600/20 to-green-700/20 group-hover:from-green-600/40 group-hover:to-green-700/40",
    iconBg: "group-hover:bg-green-500/20",
    highlightPoints: [
      "Fast distributed processing",
      "Advanced statistical methods",
      "Real-time data streaming"
    ]
  },
  {
    icon: <Brain className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />,
    title: "Smart AI Assistant",
    description: "Like having a data expert by your side, providing insights in plain language",
    detailedDescription: "Our AI assistant uses natural language processing to understand your questions about data and provides clear, insightful answers without requiring technical expertise.",
    color: "from-purple-600/20 to-purple-700/20 group-hover:from-purple-600/40 group-hover:to-purple-700/40",
    iconBg: "group-hover:bg-purple-500/20",
    highlightPoints: [
      "Natural language queries",
      "Automated insight generation",
      "Predictive analytics"
    ]
  }
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    
    // Inject animation styles
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = animationStyles;
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main animated blobs with improved colors and effects */}
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" 
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" 
          style={{
            transform: `translate(${-mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
        <div className="absolute top-[30%] left-[45%] w-[26rem] h-[26rem] bg-green-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-3000" />
        <div className="absolute bottom-[35%] right-[15%] w-[32rem] h-[32rem] bg-blue-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-5000" />
        
        {/* Added subtle grid pattern for modern design feel */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        
        {/* Add subtle noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Enhanced Hero Section */}
        <section className="min-h-screen py-10 flex items-center justify-center relative">
        
          
          <div className="container mx-auto px-4 pt-32 pb-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Product Hunt Badge */}
              <div className="flex items-center justify-center mb-6">

              <a href="https://www.producthunt.com/posts/anilyst?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-anilyst" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=945088&theme=light&t=1746875873252" alt="Anilyst - Your&#0032;Personal&#0032;AI&#0032;Data&#0032;Analyst | Product Hunt" style={{width: "250px", height: "54px"}} width="250" height="54" /></a>
              </div>

              <h1 className="text-4xl py-6 sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight relative">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">Make Sense of Your Data</span>
                
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-8 font-light px-4">
                No technical skills required. Upload your data, get beautiful visualizations, and discover valuable insights with AI.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 group">
                  <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white/80">No coding needed</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 group">
                  <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white/80">Works with your data</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 group">
                  <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white/80">Results in minutes</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <motion.button 
                    className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Launch Analyzer <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.a 
                  href="#architecture" 
                  className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-white/20 text-white rounded-lg text-lg font-medium hover:bg-white/5 transition-colors relative overflow-hidden group"
                  whileHover={{ 
                    borderColor: "rgba(255, 255, 255, 0.4)" 
                  }}
                >
                  <span className="relative z-10">How It Works</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </motion.a>
              </div>
            </motion.div>

            {/* Enhanced Main Features Grid */}
            <motion.div
              className="mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {mainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.3 + index * 0.1 } 
                    }}
                  >
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="text-white p-2 rounded-xl bg-white/5 border border-white/10 inline-flex mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 relative z-10">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 relative z-10">{feature.description}</p>
                    
                    <div className="h-1 w-0 group-hover:w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 transition-all duration-300 rounded-full"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Enhanced Coming Soon Features */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30"></div>
                <h3 className="text-xl font-semibold text-white text-center relative px-6 py-2">
                  <span className="relative z-10">Advanced Features Coming Soon</span>
                  <span className="absolute inset-0 bg-white/5 rounded-full blur-sm -z-0"></span>
                </h3>
                <div className="h-px w-8 bg-gradient-to-r from-white/30 to-transparent"></div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {advancedFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-br from-black/70 to-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/5 hover:border-white/10 relative"
                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.1)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: 0.5 + index * 0.1 } 
                    }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
                    </div>
                    
                    <div className="text-white/70 p-2 rounded-xl bg-white/5 inline-flex mb-4 relative z-10">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white/80 mb-2 relative z-10">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 relative z-10">{feature.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-purple-400 text-sm font-medium inline-flex items-center gap-1.5 relative z-10">
                        <Clock className="w-3.5 h-3.5" /> {feature.comingsoon}
                      </p>
                      
                     
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        <section id="how-it-works" className="min-h-screen flex items-center bg-black py-32 relative">
  
         
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-sm font-medium text-blue-400 mb-3 tracking-wider">SIMPLIFIED PROCESS</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative inline-block">
                How Anilyst Works
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-200 mb-12 max-w-2xl mx-auto">
                Transform your raw data into valuable insights in just four simple steps — no technical skills required
              </p>
            </motion.div>
            
            <div className="relative max-w-5xl mx-auto">
              {/* Steps with enhanced visuals */}
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
                {howItWorksSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Step Number with improved styling */}
                    <div className="absolute -left-5 -top-5 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white z-20 shadow-lg shadow-purple-500/20 border border-white/10">
                      {step.step}
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping-slow opacity-0"></div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl p-7 pl-9 border border-white/10 h-full hover:border-white/20 transition-all duration-300 shadow-xl shadow-blue-500/5 group relative overflow-hidden">
                      {/* Glow effect on hover */}
                      <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      <div className="mb-4 p-2.5 bg-white/5 rounded-xl inline-flex border border-white/10 group-hover:bg-white/10 transition-colors duration-300 relative z-10">
                        {step.icon}
                      </div>
                      
                      <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 relative z-10">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-5 relative z-10">
                        {step.description}
                      </p>
                      
                      {/* Features list with improved styling */}
                      <ul className="mt-4 space-y-3 relative z-10">
                        {step.details.map((detail, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div className="mt-1 p-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex-shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                            </div>
                            <span className="text-sm text-white/80">{detail}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Visual indicator of next step with improved animations */}
                      {index < howItWorksSteps.length - 1 && index % 2 === 0 && (
                        <div className="hidden md:flex absolute -bottom-12 right-0 items-center justify-center space-x-1">
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                          />
                          <ArrowRight className="w-5 h-5 text-purple-400 ml-1" />
                        </div>
                      )}
                      {index < howItWorksSteps.length - 1 && index % 2 === 1 && (
                        <div className="hidden md:flex absolute -bottom-12 -left-4 items-center justify-center space-x-1">
                          <ArrowRight className="w-5 h-5 text-purple-400 mr-1" />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-purple-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Enhanced center line for desktop */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent"></div>
                
                <motion.div 
                  className="absolute top-0 w-2 h-2 -ml-1 rounded-full bg-blue-500"
                  animate={{ 
                    y: ["0%", "100%"], 
                    opacity: [1, 0.5, 0],
                    scale: [1, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <motion.div 
                  className="absolute top-0 w-2 h-2 -ml-1 rounded-full bg-purple-500"
                  animate={{ 
                    y: ["0%", "100%"], 
                    opacity: [1, 0.5, 0],
                    scale: [1, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1
                  }}
                />
              </div>
            </div>

            {/* Enhanced Try It Now button */}
            <motion.div
              className="text-center mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/dashboard/agent">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-600/20 transform relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 15px 30px -5px rgba(124, 58, 237, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="relative z-10 flex items-center">
                    Experience It Yourself <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                </motion.button>
              </Link>
              <p className="text-white/60 mt-4 text-sm">No signup required. Try it with your own data in seconds.</p>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Use Cases Section */}
        <section className="py-20 bg-gradient-to-b from-black/90 via-black/95 to-black relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute left-0 top-0 w-full h-40 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
            <div className="absolute -left-20 top-40 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 bottom-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-sm font-medium text-purple-400 mb-3 tracking-wider">FOR EVERYONE</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative inline-block">
                Who Can Use Anilyst?
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Designed for everyone who works with data, not just data scientists. No technical expertise required.
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  className="mb-24 last:mb-0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center`}>
                    {/* Enhanced Image side */}
                    <div className="w-full md:w-1/2">
                      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl group h-[350px]">
                        {/* Background gradients */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${index === 0 ? 'from-blue-900/30 to-purple-900/30' : index === 1 ? 'from-green-900/30 to-blue-900/30' : 'from-purple-900/30 to-pink-900/30'} opacity-60 z-10`}></div>
                        
                        <Image
                          src={useCase.image}
                          alt={useCase.title}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Improved overlay with animation */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
                          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                {useCase.icon}
                              </div>
                              <h3 className="text-2xl md:text-3xl font-bold text-white">{useCase.title}</h3>
                            </div>
                            
                            {/* Micro preview on image hover */}
                            <p className="text-white/70 text-sm max-w-lg transform opacity-0 group-hover:opacity-100 transition-all duration-300">
                              {useCase.description.split('.')[0]}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Content side */}
                    <div className="w-full md:w-1/2">
                      <motion.div 
                        className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl p-8 border border-white/10 h-full hover:border-white/20 transition-all duration-300 shadow-xl shadow-blue-500/5 relative overflow-hidden group"
                        whileHover={{ y: -5 }}
                      >
                        {/* Animated background elements */}
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <h3 className="text-2xl font-bold text-white mb-4 md:hidden relative z-10">
                          {useCase.title}
                        </h3>
                        
                        <p className="text-gray-200 mb-6 leading-relaxed relative z-10">
                          {useCase.description}
                        </p>
                        
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          Key Benefits
                        </h4>
                        
                        <ul className="space-y-4 mb-8 relative z-10">
                          {useCase.features.map((feature, idx) => (
                            <motion.li
                              key={idx}
                              className="flex items-start gap-3 text-gray-200 group/item"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <div className="mt-1 p-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex-shrink-0 group-hover/item:from-blue-500/40 group-hover/item:to-purple-500/40 transition-all duration-300">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </div>
                              <span className="group-hover/item:text-white transition-colors duration-300">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        <div className="mt-8">
                          <Link href="/signup">
                            <motion.button 
                              className={`px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 border border-white/10 flex items-center gap-2 group/btn`}
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              Try {useCase.title} Features <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </motion.button>
                          </Link>
                        </div>
                        
                        {/* Enhanced background decorative element */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Enhanced bottom CTA */}
            <motion.div
              className="text-center mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative mb-10 max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>
                <p className="text-xl text-white/90 leading-relaxed relative z-10">
                  Whether you're an <span className="text-blue-400">analyst</span>, <span className="text-green-400">manager</span>, <span className="text-purple-400">small business owner</span>, or just curious about your data, 
                  Anilyst makes analysis simple and accessible for everyone.
                </p>
              </div>
              
              <Link href="/main">
                <motion.button 
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-xl shadow-white/10 relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 40px -10px rgba(255, 255, 255, 0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="relative z-10 flex items-center">
                    Try It Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="min-h-screen flex items-center bg-black/80 py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="px-4 py-1 bg-white/5 rounded-full text-white/60 text-sm inline-block mb-4">TECHNOLOGY</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 inline-block text-transparent bg-clip-text">
                Technology That Works For You
              </h2>
              <p className="text-lg text-gray-200 mb-12 max-w-2xl mx-auto">
                Don't worry about the technical details - we've built a powerful tool that handles the complexity, 
                so you can focus on getting insights from your data.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {userFriendlyArchitecture.map((component, index) => (
                <motion.div
                  key={index}
                  className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/10 group hover:border-white/20 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-center mb-6 relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 transition-all duration-300 ${component.iconBg}`}>
                      {component.icon}
                      {/* Animated background glow */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${component.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md -z-10`}></div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                      {component.title}
                    </h3>
                    {/* Animated underline on hover */}
                    <div className="h-0.5 w-0 group-hover:w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 transition-all duration-500"></div>
                  </div>
                  
                  <div className="overflow-hidden">
                    {/* Basic description that's always visible */}
                    <p className="text-gray-300 text-center mb-4">
                      {component.description}
                    </p>
                    
                    {/* Detailed information that appears on hover */}
                    <div className="max-h-0 group-hover:max-h-72 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                      <p className="text-white/70 text-sm mb-4 text-center">
                        {component.detailedDescription}
                      </p>
                      
                      <div className="space-y-2 pb-2">
                        {component.highlightPoints.map((point, idx) => (
                          <motion.div 
                            key={idx}
                            className="flex items-center justify-center gap-1.5 text-sm text-white/60"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            <span>{point}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive button at bottom */}
                  <div className="mt-4 text-center overflow-hidden h-8">
                    <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                      <Link href="/dashboard/agent">
                        <button className="text-sm px-4 py-1.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors inline-flex items-center gap-1">
                          Learn more <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-24 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {/* Interactive testimonial card with hover effects */}
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 rounded-xl max-w-3xl mx-auto mb-12 group hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20 transition-all duration-500 border border-white/5 hover:border-white/10 relative">
                {/* Decorative quote marks */}
                <div className="absolute -top-5 -left-5 text-6xl text-white/10 font-serif">"</div>
                <div className="absolute -bottom-10 -right-5 text-6xl text-white/10 font-serif">"</div>
                
                <h4 className="text-xl font-medium text-white mb-2">Why People Love Anilyst</h4>
                <p className="text-gray-200 relative z-10">
                  I used to spend hours creating charts and trying to make sense of my data. Now I just upload my files 
                  and get insights immediately. It's like having a data analyst on call 24/7!
                </p>
                
                <div className="mt-6 flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-medium">SK</div>
                  <div className="text-left">
                    <p className="text-white/90 font-medium">Sarah K.</p>
                    <p className="text-white/60 text-sm">Marketing Manager</p>
                  </div>
                </div>
                
                {/* Interactive animation elements */}
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-blue-500/30 rounded-full filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-purple-500/30 rounded-full filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              </div>
              
              {/* Interactive CTA button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <a href="#features" className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-colors inline-flex items-center gap-2 border border-white/10">
                    Explore Key Features <ChevronRight className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="min-h-screen flex items-center bg-black py-32 relative">
         

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-sm font-medium text-blue-400 mb-3 tracking-wider">POWERFUL CAPABILITIES</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative inline-block">
                Key Capabilities
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                From intelligent data processing to AI-powered insights, Anilyst offers a comprehensive 
                suite of tools designed to transform your data experience.
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto">
              {featureSections.map((section, index) => (
                <motion.div
                  key={index}
                  className="mb-32 last:mb-8 group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  
                  <div className="md:hidden mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                        {section.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-10 items-stretch">
                    {/* Enhanced Image Side */}
                    <div className="w-full md:w-1/2">
                      <div className="relative h-full rounded-xl overflow-hidden group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 border border-white/10 group-hover:border-white/20">
                        {/* Particle effects container */}
                        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: 0
                              }}
                              animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0],
                                y: [0, -20],
                                x: [0, Math.random() * 20 - 10]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </div>
                        
                        <Image
                          src={section.image}
                          alt={section.title}
                          width={800}
                          height={500}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-tr ${section.color} ${section.hoverColor} opacity-80 transition-all duration-500 mix-blend-overlay z-10`}></div>
                        
                        {/* Enhanced desktop title overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-20">
                          <motion.div 
                            className="bg-black/70 backdrop-blur-sm px-8 py-6 rounded-xl border border-white/10"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <h3 className="text-3xl font-bold text-white text-center">{section.title}</h3>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Content Side */}
                    <div className="w-full md:w-1/2">
                      <motion.div 
                        className={`h-full bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl p-8 border border-white/10 relative overflow-hidden group-hover:bg-white/5 transition-all duration-500 shadow-lg shadow-blue-500/5`}
                        whileHover={{ y: -5 }}
                      >
                        {/* Desktop heading */}
                        <div className="hidden md:flex items-center gap-3 mb-6">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} group-hover:scale-110 transition-transform duration-300`}>
                            {section.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{section.title}</h3>
                        </div>
                        
                        <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                          {section.description}
                        </p>
                        
                        <h4 className="text-lg font-medium text-white mb-5 flex items-center gap-2">
                          <div className="p-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                          </div>
                          Key Features
                        </h4>
                        
                        <ul className="space-y-4 mb-8">
                          {section.features.map((feature, idx) => (
                            <motion.li
                              key={idx}
                              className="flex items-start gap-3 text-gray-200 group/item"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <div className="mt-1 flex-shrink-0 p-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover/item:from-blue-500/40 group-hover/item:to-purple-500/40 transition-all duration-300">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </div>
                              <span className="group-hover/item:text-white transition-colors duration-300">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        <div className="mt-8">
                          <Link href="/signup">
                            <motion.button 
                              className={`px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 border border-white/10 flex items-center gap-2 group/btn`}
                              whileHover={{ scale: 1.03 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              Try {section.title} Features <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </motion.button>
                          </Link>
                        </div>
                        
                        {/* Enhanced background decorative element */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Enhanced final call to action */}
            <motion.div
              className="text-center mt-24 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 rounded-xl border border-white/5 mb-10 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                {/* Animated background elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Ready to unlock your data's potential?</h3>
                <p className="text-gray-200 mb-8 relative z-10 leading-relaxed">
                  Experience the power of intelligent data analysis with no technical skills required. 
                  Our platform adapts to your data, providing insights that drive better decisions.
                </p>
                <Link href="/signup">
                  <motion.button 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium transition-all shadow-lg shadow-purple-500/20 relative overflow-hidden group/btn"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 15px 30px -5px rgba(124, 58, 237, 0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started Now <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  </motion.button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-white/60">
                <motion.span 
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Server className="w-4 h-4" /> Cloud-based solution
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Lock className="w-4 h-4" /> Secure & private
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Zap className="w-4 h-4" /> Near-instant results
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  <HelpCircle className="w-4 h-4" /> 24/7 support
                </motion.span>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}