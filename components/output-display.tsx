'use client'

import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import { ChartData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function OutputDisplay({ result, chartData }: { result: string, chartData: ChartData }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Data Visualization',
        color: 'white',
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  }

  return (
    <motion.div 
      className="flex-grow space-y-8 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {chartData && (
        <motion.div
          className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl overflow-hidden shadow-neon relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
          <h2 className="text-2xl font-semibold mb-4 p-4 bg-black bg-opacity-30 text-blue-400 relative z-10">Data Visualization</h2>
          <div className="p-4 relative z-10">
            <Bar options={options} data={chartData} />
          </div>
        </motion.div>
      )}
      {result && (
        <motion.div
          className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl overflow-hidden shadow-neon relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
          <h2 className="text-2xl font-semibold mb-4 p-4 bg-black bg-opacity-30 text-purple-400 relative z-10">Analysis Result</h2>
          <div className="p-4 relative z-10">
            <p className="text-white">{result}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

