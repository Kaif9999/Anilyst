'use client'

import { useState } from 'react'
import Header from '../components/header'
import OutputDisplay from '../components/output-display'
import InputSection from '../components/input-section'

interface ChartData {
  labels: string[];
  values: number[];
}

export default function Home() {
  const [result, setResult] = useState('')
  const [chartData, setChartData] = useState<ChartData | null>(null)

  const handleResultReceived = (newResult: string, newChartData: ChartData) => {
    setResult(newResult)
    setChartData(newChartData)
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col space-y-8 relative z-10">
        <OutputDisplay result={result} chartData={chartData || { labels: [], datasets: [{ label: '', data: [], backgroundColor: [] }] }} />
        <InputSection onResultReceived={handleResultReceived} />
      </main>
    </div>
  )
}

