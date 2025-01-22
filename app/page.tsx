"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  BarChart2,
  PieChart,
  LineChart,
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Code,
  Cpu,
  GitBranch,
  Terminal,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="fixed rounded-2xl inset-0 background-animate mx-10 my-10 bg-gradient-to-br from-purple-700 via-red-500 to-green-500 opacity-90" />
      
      {/* Decorative shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-20">
        {/* Navbar */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] py-10 max-w-7xl z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
            <div className="container mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Logo Area */}
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">Anilyst</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-10">
                  <Link href="#features" className="text-white/80 hover:text-white transition-colors">Features</Link>
                  <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</Link>
                  <Link href="#docs" className="text-white/80 hover:text-white transition-colors">Docs</Link>
                  <Link href="#blog" className="text-white/80 hover:text-white transition-colors">Blog</Link>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center space-x-6">
                  <Link href="/login" className="px-5 py-2.5 text-white/80 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-white/90 transition-colors">
                    Get Started
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-40 lg:pt-48 pb-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight">
              The AI Data Analyzer
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-12 font-light px-4">
              Built to make data analysis extraordinarily powerful,
              <br className="hidden md:block" />
              Anilyst is the best way to analyze data with AI.
            </p>
            <Link href="/main">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Launch Analyzer <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          {/* Main Features */}
          <motion.div
            className="mt-20 lg:mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

        {/* Detailed Features Section with Decorative Shapes */}
        <div className="relative bg-black py-32 overflow-hidden">
          {/* Decorative Chart Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute top-40 right-20 w-48 h-48 border-4 border-green-500/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-red-500/20" style={{ clipPath: 'path("M 0,10 L 10,0 L 90,0 L 100,10 L 100,90 L 90,100 L 10,100 L 0,90 Z")' }} />
            <PieChart className="absolute top-1/4 right-1/3 w-24 h-24 text-blue-500/20" />
            <BarChart2 className="absolute bottom-1/3 left-1/3 w-32 h-32 text-green-500/20" />
            <LineChart className="absolute top-2/3 right-1/4 w-28 h-28 text-purple-500/20" />
          </div>

          <div className="container mx-auto px-4">
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

        {/* Call to Action */}
        <div className="bg-black">
          <div className="container mx-auto px-4 py-32">
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
        </div>

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