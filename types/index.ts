export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
  type: string
}

export interface AnalyticsResult {
  insights: {
    trends: string[]
    anomalies: string[]
    correlations: {
      variables: [string, string]
      strength: number
      description: string
    }[]
    statistics: {
      mean: number
      median: number
      mode: number
      outliers: number[]
    }
    queryResponse?: {
      question: string
      answer: string
      timestamp: string
    }
  }
  recommendations?: string[]
  chatHistory?: { question: string; answer: string }[]
  error?: string
} 