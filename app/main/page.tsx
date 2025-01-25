'use client'

import { useState } from 'react'
import Header from '@/components/header'
import OutputDisplay from '@/components/output-display'
import InputSection from '@/components/input-section'
import { ChartData } from '@/types'
import StarryBackground from '@/components/starry-background'
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null)

  const handleChartData = (newChartData: ChartData) => {
    setChartData(newChartData)
  }

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to the landing page if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex bg-black flex-col min-h-screen relative">
      <Header />
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      ></button>
      <StarryBackground />
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

