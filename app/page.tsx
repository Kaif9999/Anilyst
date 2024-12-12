"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Globe from "@/components/ui/globe";
import StarryBackground from '@/components/starry-background';
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BarChart2, PieChart, LineChart, Brain, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <StarryBackground />
      <div className="relative z-20 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-blue-950 text-shadow-lg">
            Anilyst
          </h1>
          <p className="text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Unlock the power of your data with our cutting-edge AI-driven analysis tool
          </p>
        </motion.div>

        <div className="relative w-full h-[400px] mb-8">
          <Globe />
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link href="/main">
            <RainbowButton>
              Launch AI Data Analyzer
            </RainbowButton>
          </Link>
          <div className="grid md:grid-cols-2 gap-8 mb-16 pt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-purple-400 rounded-3xl bg-opacity-20 border-none shadow-glow h-full overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-300 flex items-center">
                  <Brain className="mr-2 text-purple-400" /> What We Offer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-6">
                  {[
                    { icon: <BarChart2 className="text-purple-400" />, text: "Advanced AI-powered data analysis" },
                    { icon: <PieChart className="text-blue-400" />, text: "Instant insights from your CSV files" },
                    { icon: <LineChart className="text-pink-400" />, text: "Beautiful and interactive data visualizations" },
                    { icon: <Sparkles className="text-yellow-400" />, text: "Natural language querying of your data" },
                  ].map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center p-3 rounded-3xl bg-purple-800 bg-opacity-30 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-50"
                      whileHover={{ x: 10 }}
                    >
                      <span className="mr-4 text-2xl">{item.icon}</span>
                      <span className="text-lg">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-blue-300 rounded-3xl bg-opacity-20 border-none shadow-glow h-full overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-blue-300 flex items-center">
                  <ChevronRight className="mr-2 text-blue-400" /> How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-6">
                  {[
                    "Upload your CSV file",
                    "Ask questions about your data in plain English",
                    "Our AI analyzes your data and generates insights",
                    "View the results with interactive charts and graphs",
                    "Export or share your findings easily",
                  ].map((step, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center p-3 rounded-3xl bg-indigo-800 bg-opacity-30 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-50"
                      whileHover={{ x: 10 }}
                    >
                      <span className="mr-4 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </span>
                      <span className="text-lg">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </div>
          
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div>
    </div>
  )
}
