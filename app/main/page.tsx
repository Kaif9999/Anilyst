"use client";

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import OutputDisplay from '@/components/output-display'
import InputSection from '@/components/input-section'
import { ChartData } from '@/types'
import StarryBackground from '@/components/starry-background'
import { LogOut, Brain, Menu, X, ArrowDown, BarChart2, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { signOut } from "next-auth/react"

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleChartData = (newChartData: ChartData) => {
    setChartData(newChartData)
  }

  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <StarryBackground />

      {/* Navbar */}
      <nav className={`fixed py-8 top-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 scale-95' : 'md:top-2'
      }`}>
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
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col space-y-8 mt-16">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen">
        <section className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl pt-6 md:text-5xl font-bold text-white mb-4">Data Analysis Dashboard</h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Visualize and analyze your data with AI
              </p>
            </motion.div>

            {/* Visualization Section */}
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
              >
                {chartData ? (
                  <div className="space-y-8">
                    {/* Main Chart */}
                    <div className="w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6">
                      <div className="h-[600px] w-full">
                        <OutputDisplay 
                          chartData={{
                            ...chartData,
                            datasets: chartData.datasets.map((dataset, datasetIndex) => ({
                              ...dataset,
                              backgroundColor: `hsla(${datasetIndex * 60}, 70%, 60%, 0.8)`,
                              borderColor: `hsl(${datasetIndex * 60}, 70%, 60%)`,
                              borderWidth: 2,
                              hoverBackgroundColor: `hsla(${datasetIndex * 60}, 70%, 70%, 0.9)`,
                              hoverBorderColor: `hsl(${datasetIndex * 60}, 70%, 70%)`,
                              hoverBorderWidth: 3,
                            }))
                          }} 
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {['Mean', 'Median', 'Mode'].map((stat, index) => (
                        <div 
                          key={index} 
                          className="bg-white/5 rounded-xl p-6 border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <h3 className="text-white/80 text-sm font-medium mb-2">{stat}</h3>
                          <p className="text-white text-2xl font-semibold">Coming Soon</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Placeholder when no data
                  <div className="flex flex-col items-center justify-center py-20 text-white/60">
                    <BarChart2 className="w-16 h-16 mb-4 opacity-40" />
                    <p className="text-lg">Upload a CSV file to visualize your data</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Input Section - Now Below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* CSV Upload Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Upload Data can be .csv file</h2>
                <InputSection onResultReceived={handleChartData} />
              </div>

              {/* Question Input Section */}
              {chartData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Ask Questions About Your Data</h2>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask a question about your data..."
                        className="w-full bg-black/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                      <button 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

