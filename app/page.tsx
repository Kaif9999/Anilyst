"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  Clock,
  X,
} from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      {/* <div className="fixed inset-0 mx-4 my-4 md:mx-10 md:my-10 rounded-2xl background-animate opacity-80" /> */}
      
      {/* Enhanced glowing orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
        <div className="absolute top-[30%] left-[45%] w-[26rem] h-[26rem] bg-green-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-3000" />
        <div className="absolute bottom-[35%] right-[15%] w-[32rem] h-[32rem] bg-blue-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-5000" />
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="p-6">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col space-y-8 mt-16">
            <Link href="#features" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">Features</Link>
            <Link href="/pricing" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">Pricing</Link>
            <Link href="#docs" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">Docs</Link>
            <Link href="#blog" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">Blog</Link>
            <div className="pt-8 border-t border-white/10">
              <Link href="/login" className="block w-full py-3 text-center text-xl text-white hover:bg-white/10 rounded-lg mb-4">
                Sign In
              </Link>
              <Link href="/signup" className="block w-full py-3 text-center text-xl bg-white text-black hover:bg-white/90 rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20">
        {/* Navbar */}
        <nav className="fixed py-8 top-0 md:top-2 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-40">
          <div className="bg-black backdrop-blur-lg border border-white/20 rounded-2xl">
            <div className="container mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Logo Area */}
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-white">Anilyst</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-10">
                  <Link href="#features" className="text-white/80 hover:text-white transition-colors">Features</Link>
                  <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">Pricing</Link>
                  <Link href="#docs" className="text-white/80 hover:text-white transition-colors">Docs</Link>
                  <Link href="#blog" className="text-white/80 hover:text-white transition-colors">Blog</Link>
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/login" className="px-5 py-2.5 text-white/80 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-white/90 transition-colors">
                    Get Started
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </nav>

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
                The AI Data Analyzer
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-12 font-light px-4">
                Built to make data analysis extraordinarily powerful,
                <br className="hidden md:block" />
                Anilyst is the best way to analyze data with AI.
              </p>
              <Link href="/main">
                <button className="px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                  Launch Analyzer <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>

            {/* Main Features */}
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  {
                    icon: <Cpu className="w-6 h-6" />,
                    title: "AI-Powered Analysis",
                    description: "Advanced machine learning algorithms analyze your data in real-time",
                  },
                  {
                    icon: <Terminal className="w-6 h-6" />,
                    title: "Natural Language",
                    description: "Query your data using plain English, get instant insights",
                  },
                  {
                    icon: <GitBranch className="w-6 h-6" />,
                    title: "Version Control",
                    description: "Track changes and collaborate with your team seamlessly",
                  },
                  {
                    icon: <Code className="w-6 h-6" />,
                    title: "Custom Scripts",
                    description: "Write custom analysis scripts in Python or R",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-white mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-200">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-screen flex items-center bg-black py-32">
          <div className="container mx-auto px-4">
            <div className="relative">
              {/* Decorative Chart Shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute top-40 right-20 w-48 h-48 border-4 border-green-500/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-red-500/20" style={{ clipPath: 'path("M 0,10 L 10,0 L 90,0 L 100,10 L 100,90 L 90,100 L 10,100 L 0,90 Z")' }} />
                <PieChart className="absolute top-1/4 right-1/3 w-24 h-24 text-blue-500/20" />
                <BarChart2 className="absolute bottom-1/3 left-1/3 w-32 h-32 text-green-500/20" />
                <LineChart className="absolute top-2/3 right-1/4 w-28 h-28 text-purple-500/20" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-20"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Powerful Features for Data Analysis
                </h2>
                <p className="text-xl text-gray-200 max-w-2xl mx-auto px-4">
                  Everything you need to analyze, visualize, and understand your data
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {[
                  {
                    title: "Data Processing",
                    description: "Process large datasets efficiently with our distributed computing engine",
                    features: [
                      "Automatic data cleaning and preprocessing",
                      "Support for multiple file formats",
                      "Real-time data streaming",
                      "Custom data transformations",
                    ],
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
                  },
                  {
                    title: "Visualization",
                    description: "Create beautiful, interactive visualizations that tell your data's story",
                    features: [
                      "Interactive dashboards",
                      "Custom chart types",
                      "Real-time updates",
                      "Export capabilities",
                    ],
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
                  },
                  {
                    title: "AI Integration",
                    description: "Leverage advanced AI capabilities for deeper insights",
                    features: [
                      "Predictive analytics",
                      "Anomaly detection",
                      "Pattern recognition",
                      "Automated reporting",
                    ],
                    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
                  },
                ].map((section, index) => (
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
                      <h3 className="text-2xl font-bold text-white mb-4">{section.title}</h3>
                      <p className="text-gray-300 mb-6">{section.description}</p>
                      <ul className="space-y-3">
                        {section.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-gray-200">
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

        {/* How It Works Section */}
        <section className="min-h-screen flex items-center bg-black py-6">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How Anilyst Works
              </h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto px-4">
                Simple steps to unlock powerful insights from your data
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              {/* What We Offer */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-purple-900/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <h3 className="text-3xl font-bold text-purple-300">What We Offer</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: <BarChart2 className="w-6 h-6" />,
                      text: "Advanced AI-powered data analysis"
                    },
                    {
                      icon: <Clock className="w-6 h-6" />,
                      text: "Instant insights from your CSV files"
                    },
                    {
                      icon: <LineChart className="w-6 h-6" />,
                      text: "Beautiful and interactive data visualizations"
                    },
                    {
                      icon: <Sparkles className="w-6 h-6" />,
                      text: "Natural language querying of your data"
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-purple-950/40 rounded-2xl p-4 border border-purple-500/10"
                    >
                      <div className="text-purple-400">{item.icon}</div>
                      <p className="text-purple-100">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* How It Works Steps */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-900/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-8">
                  <ArrowRight className="w-8 h-8 text-blue-400" />
                  <h3 className="text-3xl font-bold text-blue-300">How It Works</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      number: "1",
                      text: "Upload your CSV file"
                    },
                    {
                      number: "2",
                      text: "Ask questions about your data in plain English"
                    },
                    {
                      number: "3",
                      text: "Our AI analyzes your data and generates insights"
                    },
                    {
                      number: "4",
                      text: "View the results with interactive charts and graphs"
                    },
                    {
                      number: "5",
                      text: "Export or share your findings easily"
                    }
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-blue-950/40 rounded-2xl p-4 border border-blue-500/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">
                        {step.number}
                      </div>
                      <p className="text-blue-100">{step.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
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
                Ready to Transform Your Data Analysis?
              </h2>
              <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto px-4">
                Join thousands of data scientists and analysts who have already discovered
                the power of AI-driven analysis.
              </p>
              <Link href="/main">
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Anilyst</h3>
                <p className="text-gray-400">
                  Advanced AI-powered data analysis platform for modern businesses.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8">
              <p className="text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} Anilyst. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}