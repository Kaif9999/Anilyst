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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

// Feature data
const mainFeatures = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your data in real-time",
    comingsoon: "Coming Soon",
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: "Natural Language",
    description: "Query your data using plain English, get instant insights",
    comingsoon: "Coming Soon",
  },
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
    description: "Process large datasets efficiently with our distributed computing engine",
    features: [
      "Automatic data cleaning and preprocessing",
      "Support for multiple file formats",
      "Real-time data streaming",
      "Custom data transformations",
    ],
    comingsoon: "Coming Soon",
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
    comingsoon: "Coming Soon",
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
    comingsoon: "Coming Soon",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
  },
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
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
        <div className="absolute top-[30%] left-[45%] w-[26rem] h-[26rem] bg-green-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-3000" />
        <div className="absolute bottom-[35%] right-[15%] w-[32rem] h-[32rem] bg-blue-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-5000" />
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
                    <p className="text-gray-200">{feature.comingsoon}</p>
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
                Join thousands of data scientists and analysts who have already
                discovered the power of AI-driven analysis.
              </p>
              <Link href="/main">
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}