export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export interface AnalyticsResult {
  chartData: ChartData
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
  recommendations: string[]
} 