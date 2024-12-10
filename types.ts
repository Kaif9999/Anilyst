export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'doughnut' 
  | 'radar' 
  | 'polarArea'
  | 'bubble'
  | 'scatter'
  | 'area'
  | 'horizontalBar'
  | 'stackedBar'
  | 'stackedArea'
  | 'multiAxis'
  | 'combo';

export interface ChartDataset {
  label: string;
  data: Array<number | { x: number; y: number; r?: number }>;
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  type?: string;
  yAxisID?: string;
  xAxisID?: string;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  trendline?: {
    type: 'linear' | 'exponential' | 'moving-average';
    data: number[];
    label: string;
    borderColor: string;
  };
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DataInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  importance: 'high' | 'medium' | 'low';
}

export interface AnalyticsResult {
  trends: {
    type: 'increasing' | 'decreasing';
    slope: number;
    confidence: number;
  };
  outliers: {
    indices: number[];
    values: number[];
    zscore: number[];
  };
  forecast: {
    values: number[];
    confidence: number;
    range: {
      upper: number[];
      lower: number[];
    };
  };
  correlations: {
    pearson: number;
    spearman: number;
  };
  statistics: {
    basic: {
      mean: number;
      median: number;
      mode: number[];
      stdDev: number;
      variance: number;
      skewness: number;
      kurtosis: number;
    };
    distribution: {
      type: string;
      parameters: {
        mean: number;
        stdDev: number;
      };
      goodnessOfFit: number;
    };
  };
}

export interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  [key: string]: string | number;
}

export interface SimpleData {
  [key: string]: string | number;
}

export interface TimeSeriesAnalysis {
  seasonality: {
    detected: boolean;
    period: number;
    strength: number;
  };
  trend: {
    type: 'linear' | 'exponential' | 'polynomial';
    equation: string;
    r2: number;
  };
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
} 