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

// Feature sections data
const featureSections = [
  {
    title: "Data Processing",
    description:
      "Process large datasets efficiently with our distributed computing engine",
    features: [
      "Automatic data cleaning and preprocessing",
      "Support for CSV, Excel, and PDF formats",
      "Real-time data streaming",
      "Custom data transformations",
    ],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
  },
  {
    title: "Visualization",
    description:
      "Create beautiful, interactive visualizations that tell your data's story",
    features: [
      "Interactive dashboards with 8+ chart types",
      "Downloadable charts and raw data",
      "Full-screen visualization mode",
      "Customizable colors and options",
    ],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
  {
    title: "AI Integration",
    description: "Leverage advanced AI capabilities for deeper insights",
    features: [
      "Time-series forecasting with machine learning",
      "Anomaly detection using statistical models",
      "Pattern recognition with AI algorithms",
      "Automated reporting and insights generation",
    ],
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
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

// Add new section for how it works
const howItWorksSteps = [
  {
    step: 1,
    title: "Upload Your Data",
    description: "Simply drag and drop your spreadsheet file - we support Excel, CSV, and even PDF tables",
    icon: <FileSpreadsheet className="w-8 h-8 text-blue-400" />,
  },
  {
    step: 2,
    title: "Instant Visualization",
    description: "Your data is automatically transformed into beautiful, interactive charts and graphs",
    icon: <BarChart2 className="w-8 h-8 text-green-400" />,
  },
  {
    step: 3,
    title: "AI-Powered Insights",
    description: "Our AI analyzes your data and highlights important trends, patterns, and predictions",
    icon: <Brain className="w-8 h-8 text-purple-400" />,
  },
  {
    step: 4,
    title: "Ask Questions",
    description: "Ask questions about your data in plain English - no technical knowledge required",
    icon: <MessageSquare className="w-8 h-8 text-yellow-400" />,
  },
];

// Add use cases section
const useCases = [
  {
    title: "Business Reporting",
    description: "Turn sales data into clear insights without spending hours in spreadsheets",
    icon: <BarChart className="w-8 h-8" />,
  },
  {
    title: "Financial Analysis",
    description: "Understand market trends and make data-driven investment decisions",
    icon: <DollarSign className="w-8 h-8" />,
  },
  {
    title: "Health & Fitness",
    description: "Track your progress and discover patterns in your personal health data",
    icon: <Heart className="w-8 h-8" />,
  },
];

// Add simple explanations for technical terms section
const userFriendlyArchitecture = [
  {
    icon: <BarChart className="w-6 h-6 text-blue-400" />,
    title: "Easy-to-Use Interface",
    description: "A beautiful, simple dashboard that makes data analysis accessible to everyone"
  },
  {
    icon: <Server className="w-6 h-6 text-green-400" />,
    title: "Powerful Analysis Engine",
    description: "Our behind-the-scenes technology handles complex calculations so you don't have to"
  },
  {
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    title: "Smart AI Assistant",
    description: "Like having a data expert by your side, providing insights in plain language"
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
                Get from raw data to valuable insights in just a few simple steps
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
                    <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                      {step.step}
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 pl-8 border border-white/10">
                      <div className="mb-4">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Center line for desktop */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
            </div>
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
                Designed for everyone who works with data, not just data scientists
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-900/80 to-black/90 rounded-xl p-8 border border-white/10 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-300">
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-lg text-white/80 mb-8">
                Whether you're an analyst, manager, small business owner, or just curious about your data, Anilyst makes analysis simple.
              </p>
              <Link href="/main">
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
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
                  className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.2 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                      {component.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {component.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-center">
                    {component.description}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-6 rounded-xl inline-block mb-8">
                <h4 className="text-xl font-medium text-white mb-2">Why People Love Anilyst</h4>
                <p className="text-gray-200">
                  "I used to spend hours creating charts and trying to make sense of my data. Now I just upload my files 
                  and get insights immediately. It's like having a data analyst on call 24/7!"
                </p>
                <p className="text-white/60 mt-2 text-sm">- Sarah K., Marketing Manager</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#features" className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2">
                  See Features <ChevronRight className="w-5 h-5" />
                </a>
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
                From data processing to AI-powered insights, Anilyst offers a comprehensive suite of tools.
              </p>
            </motion.div>
            
            <div className="relative">
              {/* Feature Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {featureSections.map((section, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 rounded-2xl overflow-hidden border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.2 }}
                  >
                    <Image
                      src={section.image}
                      alt={section.title}
                      width={800}
                      height={400}
                      className="w-full object-cover h-48"
                    />
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {section.title}
                      </h3>
                      <p className="text-gray-300 mb-6">
                        {section.description}
                      </p>
                      <ul className="space-y-3">
                        {section.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center text-gray-200"
                          >
                            <ChevronRight className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="min-h-[70vh] flex items-center bg-black">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Ready to Unlock the Power of Your Data?
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto px-4">
                Join thousands of people who've discovered hidden insights in their data without needing technical skills or expensive software.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/main">
                  <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                    Start Analyzing Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-lg text-lg font-medium hover:bg-white/10 transition-colors">
                    See Pricing
                  </button>
                </Link>
              </div>
              <p className="text-white/60 text-sm">
                No credit card required to start. Free plan includes 5 analyses per month.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}