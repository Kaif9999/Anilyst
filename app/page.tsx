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
import WaitlistForm from "@/components/WaitlistForm";

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
  {
    title: "Health & Fitness",
    description: "Track your progress and discover patterns in your personal health data. Perfect for health enthusiasts, trainers, and healthcare professionals who want to understand patterns in health metrics and optimize wellness programs.",
    icon: <Heart className="w-8 h-8" />,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    features: [
      "Visualize fitness progress over time",
      "Identify factors affecting health outcomes",
      "Optimize workout and nutrition plans"
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Background Elements */}
      {/* <div className="fixed inset-0 mx-4 my-4 md:mx-10 md:my-10 rounded-2xl background-animate opacity-80" /> */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
        <div className="absolute top-[30%] left-[45%] w-[26rem] h-[26rem] bg-green-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-3000" />
        <div className="absolute bottom-[35%] right-[15%] w-[32rem] h-[32rem] bg-blue-500/70 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-5000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="min-h-screen py-10 flex items-center justify-center">
          <div className="container mx-auto px-4 pt-32 pb-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl py-8 sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight">
                Make Sense of Your Data
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-8 font-light px-4">
                No technical skills required. Upload your data, get beautiful visualizations, and discover valuable insights with AI.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">No coding needed</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Works with your files</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Results in minutes</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/main">
                  <button className="px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                    Launch Analyzer <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <a href="#architecture" className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-white/30 text-white rounded-lg text-lg font-medium hover:bg-white/10 transition-colors">
                  How It Works
                </a>
              </div>
            </motion.div>

            {/* Main Features Grid */}
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {mainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-white mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-200">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Coming Soon Features */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Advanced Features Coming Soon</h3>
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
                {advancedFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-white/70 mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white/80 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">{feature.description}</p>
                    <p className="text-purple-400 mt-2 text-sm font-medium">{feature.comingsoon}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="min-h-screen flex items-center bg-black py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                How Anilyst Works
              </h2>
              <p className="text-lg text-gray-200 mb-12 max-w-2xl mx-auto">
                Transform your raw data into valuable insights in just four simple steps — no technical skills required
              </p>
            </motion.div>
            
            <div className="relative max-w-5xl mx-auto">
              {/* Steps */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                {howItWorksSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {/* Step Number */}
                    <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white z-10">
                      {step.step}
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 pl-8 border border-white/10 h-full">
                      <div className="mb-4">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {step.description}
                      </p>
                      
                      {/* Features list */}
                      <ul className="mt-4 space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-sm text-white/70">{detail}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Visual indicator of next step */}
                      {index < howItWorksSteps.length - 1 && index % 2 === 0 && (
                        <div className="hidden md:block absolute -bottom-10 right-0 text-purple-400">
                          <ArrowRight className="w-8 h-8" />
                        </div>
                      )}
                      {index < howItWorksSteps.length - 1 && index % 2 === 1 && (
                        <div className="hidden md:block absolute -bottom-10 -left-4 text-purple-400">
                          <ArrowRight className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Center line for desktop */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
            </div>

            {/* Try It Now button */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/main">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20 transform hover:scale-105">
                  Experience It Yourself <ArrowRight className="w-5 h-5 inline-block ml-2" />
                </button>
              </Link>
              <p className="text-white/60 mt-4 text-sm">No signup required. Try it with your own data in seconds.</p>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-gradient-to-b from-black/80 to-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Who Can Use Anilyst?
              </h2>
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Designed for everyone who works with data, not just data scientists. No technical expertise required.
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  className="mb-16 last:mb-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
                    {/* Image side */}
                    <div className="w-full md:w-1/2">
                      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg h-[300px] group">
                        <Image
                          src={useCase.image}
                          alt={useCase.title}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                {useCase.icon}
                              </div>
                              <h3 className="text-2xl font-bold text-white">{useCase.title}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content side */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-full hover:bg-white/10 transition-colors duration-300">
                        <h3 className="text-2xl font-bold text-white mb-4 md:hidden">
                          {useCase.title}
                        </h3>
                        <p className="text-gray-300 mb-6">
                          {useCase.description}
                        </p>
                        
                        <h4 className="text-lg font-medium text-white mb-3">Key Benefits:</h4>
                        <ul className="space-y-3">
                          {useCase.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-gray-200"
                            >
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-6">
                          <Link href="/main">
                            <button className="px-4 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 border border-white/10 flex items-center gap-2">
                              Try with your data <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Whether you're an analyst, manager, small business owner, or just curious about your data, 
                Anilyst makes analysis simple and accessible for everyone.
              </p>
              <Link href="/main">
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg">
                  Try It Now <ArrowRight className="w-5 h-5" />
                </button>
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
                      <Link href="/main">
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

        {/* Features Section */}
        <section id="features" className="min-h-screen flex items-center bg-black py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Key Capabilities
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
                  className="mb-20 last:mb-8 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {/* Feature heading for mobile */}
                  <div className="md:hidden mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                        {section.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2">
                      <div className="relative h-full rounded-xl overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-500">
                        <Image
                          src={section.image}
                          alt={section.title}
                          width={800}
                          height={500}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-tr ${section.color} ${section.hoverColor} opacity-80 transition-all duration-500 mix-blend-overlay`}></div>
                        
                        {/* Desktop title overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                          <div className="bg-black/70 backdrop-blur-sm px-8 py-6 rounded-xl border border-white/10">
                            <h3 className="text-3xl font-bold text-white text-center">{section.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Side */}
                    <div className="w-full md:w-1/2">
                      <div className={`h-full bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 relative overflow-hidden group-hover:bg-white/10 transition-all duration-500`}>
                        {/* Desktop heading */}
                        <div className="hidden md:flex items-center gap-3 mb-6">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                            {section.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                        </div>
                        
                        <p className="text-gray-200 mb-6 text-lg">
                          {section.description}
                        </p>
                        
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          Key Features
                        </h4>
                        <ul className="space-y-3 mb-6">
                          {section.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-gray-200 group/item"
                            >
                              <div className="mt-1 flex-shrink-0 p-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover/item:from-blue-500/40 group-hover/item:to-purple-500/40 transition-all duration-300">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-6">
                          <Link href="/main">
                            <button className={`px-5 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 transform hover:scale-105 border border-white/10 flex items-center gap-2`}>
                              Try {section.title} Features <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                        
                        {/* Background decorative element */}
                        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Final call to action */}
            <motion.div
              className="text-center mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 rounded-xl border border-white/5 mb-10">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to unlock your data's potential?</h3>
                <p className="text-gray-200 mb-6">
                  Experience the power of intelligent data analysis with no technical skills required. 
                  Our platform adapts to your data, providing insights that drive better decisions.
                </p>
                <Link href="/main">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20 transform hover:scale-105">
                    Get Started Now <ArrowRight className="w-5 h-5 inline-block ml-2" />
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Server className="w-4 h-4" /> Cloud-based solution
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4" /> Secure & private
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Near-instant results
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" /> 24/7 support
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}