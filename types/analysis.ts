export interface AnalysisResult {
  chartData: any
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
  }
  recommendations: string[]
  predictions?: {
    forecast: number[]
    confidence: number
    explanation: string
  }
} 