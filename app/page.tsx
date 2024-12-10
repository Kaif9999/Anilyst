'use client'

import { useState } from 'react'
import Header from '../components/header'
import OutputDisplay from '../components/output-display'
import InputSection from '../components/input-section'
import { ChartData } from '../types'

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null)

  const handleChartData = (newChartData: ChartData) => {
    setChartData(newChartData)
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col space-y-8 relative z-10">
        <OutputDisplay chartData={chartData || { 
          labels: [], 
          datasets: [{ 
            label: 'Data', 
            data: [], 
            backgroundColor: [] 
          }] 
        }} />
        <InputSection onResultReceived={handleChartData} />
      </main>
    </div>
  )
}

