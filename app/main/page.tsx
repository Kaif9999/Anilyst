"use client";

import { useState } from 'react'
import Header from '@/components/header'
import OutputDisplay from '@/components/output-display'
import InputSection from '@/components/input-section'
import { ChartData } from '@/types'
import StarryBackground from '@/components/starry-background'
import { signOut } from "next-auth/react";
import { Brain, LogOut } from "lucide-react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";


export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null)

  const handleChartData = (newChartData: ChartData) => {
    setChartData(newChartData)
  }



  return (
    <div className="flex bg-black flex-col min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Anilyst</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <StarryBackground />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 flex flex-col space-y-8 relative z-10">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">AI Data Analysis</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Upload your CSV file and ask questions about your data. Our AI will analyze it and provide insights.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/10">
              <InputSection onResultReceived={handleChartData} />
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/10">
              <OutputDisplay 
                chartData={chartData || { 
                  labels: [], 
                  datasets: [{ 
                    label: 'Data', 
                    data: [], 
                    backgroundColor: [] 
                  }] 
                }} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

