'use client'

import { useState } from 'react'
import { Upload, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { ChartData } from '../types'

// Define the CSV data structure
interface CSVRow {
  [key: string]: string | number; // Adjust based on your CSV structure
}

export default function InputSection({ onResultReceived }: { onResultReceived: (result: string, chartData: ChartData) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (file && question) {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('question', question)

      try {
        const response = await fetch('/api', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        const chartData = generateChartData(data.csvData)
        onResultReceived(data.result, chartData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const generateChartData = (csvData: CSVRow[]) => {
    const labels = csvData.map((row) => row[Object.keys(row)[0]] as string)
    const values = csvData.map((row) => parseFloat(row[Object.keys(row)[1]] as string))

    return {
      labels,
      datasets: [
        {
          label: 'Data',
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
    }
  }

  return (
    <motion.div 
      className="backdrop-blur-md bg-white bg-opacity-10 p-6 rounded-2xl shadow-neon relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10"></div>
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="flex items-center space-x-4">
          <input
            id="csv"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.label
            htmlFor="csv"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors shadow-neon"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? file.name : 'Upload CSV'}
          </motion.label>
        </div>
        <motion.textarea
          placeholder="Ask a question about your data..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-4 bg-gray-800 bg-opacity-50 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-neon"
          rows={4}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          type="submit"
          disabled={!file || !question || isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-neon"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Analyzing...' : <><Send className="inline mr-2 h-4 w-4" /> Analyze Data</>}
        </motion.button>
      </form>
    </motion.div>
  )
}

