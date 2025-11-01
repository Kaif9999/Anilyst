"use client";

import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";

// Dynamically import chart components
const Bar = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Bar })));
const Line = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Line })));
const Pie = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Pie })));
const Doughnut = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Doughnut })));
const Radar = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Radar })));
const PolarArea = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.PolarArea })));
const Scatter = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Scatter })));
const Bubble = lazy(() => import("react-chartjs-2").then(mod => ({ default: mod.Bubble })));

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  ScatterController,
  ChartType,
  ChartTypeRegistry,
  ChartData as ChartJSData,
  ChartOptions,
} from "chart.js";
import {
  BarChart2,
  LineChart,
  PieChart,
  Radar as RadarIcon,
  Circle,
  Target,
  Palette,
  Download,
  Share2,
  Settings,
  SortAsc,
  SortDesc,
  TrendingUp,
  AlertTriangle,
  Brain,
  Clock,
  BarChart,
  Activity,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Maximize2,
  X,
  Eye,
  Calendar,
} from "lucide-react";
import regression from "regression";
import * as ss from "simple-statistics";
import { AnalyticsResult, DataInsight } from "@/types";
import { TimeSeriesAnalysis } from "@/types";

// Register Chart.js only when component mounts
useEffect(() => {
  import("chart.js").then((ChartJS) => {
    ChartJS.Chart.register(
      ChartJS.CategoryScale,
      ChartJS.LinearScale,
      ChartJS.PointElement,
      ChartJS.LineElement,
      ChartJS.BarElement,
      ChartJS.ArcElement,
      ChartJS.RadialLinearScale,
      ChartJS.BubbleController,
      ChartJS.ScatterController,
      ChartJS.Title,
      ChartJS.Tooltip,
      ChartJS.Legend
    );
  });
}, []);

type BasicChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';
type ExtendedChartType = BasicChartType | 'horizontalBar' | 'stackedBar' | 'area' | 'stackedArea' | 'multiAxis' | 'combo';

interface ChartSettings {
  showGrid: boolean;
  showLegend: boolean;
  enableAnimation: boolean;
  chartTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showTrendline: boolean;
  showOutliers: boolean;
  showForecast: boolean;
  showTooltips: boolean;
}

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  scatter: Scatter,
  bubble: Bubble,
} as const;

const chartIcons = {
  bar: BarChart2,
  line: LineChart,
  pie: PieChart,
  doughnut: Circle,
  radar: RadarIcon,
  polarArea: Target,
  scatter: GitBranch,
  bubble: Circle,
  area: Activity,
  horizontalBar: BarChart,
  stackedBar: GitMerge,
  stackedArea: GitPullRequest,
  multiAxis: Activity,
  combo: Activity,
} as const;

// Vibrant color schemes
const colorSchemes = {
  vibrant: {
    close: "rgba(255, 99, 132, 0.7)", // Pink
    open: "rgba(54, 162, 235, 0.7)", // Blue
    high: "rgba(75, 192, 192, 0.7)", // Teal
    low: "rgba(153, 102, 255, 0.7)", // Purple
  },
  pastel: {
    close: "rgba(255, 182, 193, 0.7)", // Light Pink
    open: "rgba(173, 216, 230, 0.7)", // Light Blue
    high: "rgba(176, 224, 230, 0.7)", // Powder Blue
    low: "rgba(221, 160, 221, 0.7)", // Plum
  },
  neon: {
    close: "rgba(255, 0, 102, 0.7)", // Neon Pink
    open: "rgba(0, 255, 255, 0.7)", // Neon Cyan
    high: "rgba(0, 255, 0, 0.7)", // Neon Green
    low: "rgba(255, 0, 255, 0.7)", // Neon Magenta
  },
  earth: {
    close: "rgba(139, 69, 19, 0.7)", // Saddle Brown
    open: "rgba(160, 82, 45, 0.7)", // Sienna
    high: "rgba(85, 107, 47, 0.7)", // Dark Olive Green
    low: "rgba(165, 42, 42, 0.7)", // Brown
  },
  ocean: {
    close: "rgba(0, 119, 190, 0.7)", // Deep Blue
    open: "rgba(3, 169, 244, 0.7)", // Light Blue
    high: "rgba(0, 188, 212, 0.7)", // Cyan
    low: "rgba(0, 150, 136, 0.7)", // Teal
  },
} as const;

interface BaseDataPoint {
  x: number;
  y: number;
}

interface ScatterDataPoint extends BaseDataPoint {}

interface BubbleDataPoint extends BaseDataPoint {
  r: number;
}

type DataPoint = number | ScatterDataPoint | BubbleDataPoint;

// Add the missing ImportedChartData interface
interface ImportedChartData {
  labels?: string[];
  datasets: {
    label?: string;
    data: (number | any[])[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

interface ChartDataset {
  label?: string;
  data: DataPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  pointRadius?: number;
  pointHoverRadius?: number;
  type?: string;
  borderWidth?: number;
}

interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

// Add chart type specific options
const getChartTypeOptions = (type: ExtendedChartType) => {
  switch (type) {
    case "horizontalBar":
      return {
        indexAxis: "y" as const,
      };
    case "stackedBar":
      return {
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      };
    case "stackedArea":
      return {
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      };
    case "area":
      return {
        fill: true,
        tension: 0.4,
      };
    case "multiAxis":
      return {
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
          },
          y2: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
              drawOnChartArea: true,
            },
          },
        },
      };
    case "combo":
      return {
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
          },
        },
      };
    default:
      return {};
  }
};

type ColorSchemeKey = keyof typeof colorSchemes;

const prepareScatterData = (data: ImportedChartData, colorScheme: ColorSchemeKey): ChartData => {
  const currentColors = colorSchemes[colorScheme];
  return {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset): ChartDataset => ({
      label: dataset.label,
      data: dataset.data.map((value): ScatterDataPoint => ({
        x: Array.isArray(value) ? value[0] : 0,
        y: typeof value === 'number' ? value : 0,
      })),
      backgroundColor: currentColors.close,
      borderColor: currentColors.close,
      pointRadius: 6,
      pointHoverRadius: 8,
    })),
  };
};

const prepareBubbleData = (data: ImportedChartData, colorScheme: ColorSchemeKey): ChartData => {
  const currentColors = colorSchemes[colorScheme];
  return {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset): ChartDataset => ({
      label: dataset.label,
      data: dataset.data.map((value): BubbleDataPoint => ({
        x: Array.isArray(value) ? value[0] : 0,
        y: typeof value === 'number' ? value : 0,
        r: typeof value === 'number' ? Math.abs(value) / 10 : 1,
      })),
      backgroundColor: currentColors.close,
    })),
  };
};

const filterDataByYear = (data: ChartData, year: string): ChartData => {
  if (year === 'all') return data;

  const yearIndices = data.labels?.map((label, index) => 
    label.includes(year) ? index : -1
  ).filter(i => i !== -1) ?? [];

  return {
    labels: yearIndices.map(i => data.labels![i]),
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: yearIndices.map(i => dataset.data[i])
    }))
  };
};

const prepareChartData = (type: ExtendedChartType, data: ImportedChartData, colorScheme: ColorSchemeKey): ChartData => {
  if (type === 'scatter') {
    return prepareScatterData(data, colorScheme);
  }
  if (type === 'bubble') {
    return prepareBubbleData(data, colorScheme);
  }

  const colors = colorSchemes[colorScheme];
  
  return {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset: any): ChartDataset => {
      const baseDataset: ChartDataset = {
        ...dataset,
        type,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        data: dataset.data as DataPoint[] // Cast to compatible type
      };

      // Assign colors based on dataset label
      if (dataset.label?.toLowerCase().includes("close")) {
        return {
          ...baseDataset,
          backgroundColor: colors.close,
          borderColor: colors.close,
        };
      } else if (dataset.label?.toLowerCase().includes("open")) {
        return {
          ...baseDataset,
          backgroundColor: colors.open,
          borderColor: colors.open,
        };
      } else if (dataset.label?.toLowerCase().includes("high")) {
        return {
          ...baseDataset,
          backgroundColor: colors.high,
          borderColor: colors.high,
        };
      } else if (dataset.label?.toLowerCase().includes("low")) {
        return {
          ...baseDataset,
          backgroundColor: colors.low,
          borderColor: colors.low,
        };
      }

      return {
        ...baseDataset,
        backgroundColor: colors.close,
        borderColor: colors.close,
      };
    }),
  };
};

interface OutputDisplayProps {
  data: ChartData;
  title: string;
  predictionResult?: {
    forecast_values: number[];
    model_metrics: {
      mae: number;
      mse: number;
      rmse: number;
      r2: number;
    };
    seasonality: {
      weekly: number;
      monthly: number;
    };
  };
  isFullScreen?: boolean;
  onClose?: () => void;
  onFullScreen?: () => void;
}

export default function OutputDisplay({ data, title, predictionResult, isFullScreen = false, onClose, onFullScreen }: OutputDisplayProps) {
  const [chartType, setChartType] = useState<ExtendedChartType>("bar");
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorSchemeKey>("vibrant");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [showSettings, setShowSettings] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>({
    showGrid: true,
    showLegend: false,
    enableAnimation: true,
    chartTitle: "Data Visualization",
    xAxisLabel: "Categories",
    yAxisLabel: "Values",
    showTrendline: true,
    showOutliers: true,
    showForecast: true,
    showTooltips: true,
  });
  const chartRef = useRef<ChartJS | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [timeSeriesAnalysis, setTimeSeriesAnalysis] =
    useState<TimeSeriesAnalysis | null>(null);
  const [sortedData, setSortedData] = useState<ChartData | null>(null);
  const [isYearData, setIsYearData] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const [showAllYears, setShowAllYears] = useState(false);
  const [isShowingAllYears, setIsShowingAllYears] = useState(false);

  // Define a ref for directly accessing the canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add new state for data filtering
  const [availableTimeOptions, setAvailableTimeOptions] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all");
  const [timeFilterType, setTimeFilterType] = useState<"year" | "month" | "week" | "none">("none");
  const [filteredChartData, setFilteredChartData] = useState<ChartData | null>(null);

  // Advanced Analytics Functions
  const performAnalytics = (data: number[]): AnalyticsResult | null => {
    if (!data || data.length === 0) return null;

    const validNumbers = data.filter((n) => typeof n === "number" && !isNaN(n));
    if (validNumbers.length === 0) return null;

    // Basic Statistics
    const mean = ss.mean(validNumbers);
    const median = ss.median(validNumbers);
    const stdDev = ss.standardDeviation(validNumbers);
    const variance = ss.variance(validNumbers);
    
    // Fix for "sampleSkewness requires at least three data points" error
    // Check if we have enough data points for skewness and kurtosis calculations
    let skewness = 0;
    let kurtosis = 0;
    
    // Only calculate skewness and kurtosis if we have at least 3 data points
    if (validNumbers.length >= 3) {
      try {
        skewness = ss.sampleSkewness(validNumbers);
        kurtosis = ss.sampleKurtosis(validNumbers);
      } catch (error) {
        console.warn("Error calculating skewness or kurtosis:", error);
        // Use default values if calculations fail
        skewness = 0;
        kurtosis = 0;
      }
    } else {
      console.warn("Not enough data points for skewness and kurtosis calculations (need at least 3)");
    }

    // Trend Analysis
    const points = validNumbers.map((y, x) => [x, y]);
    const trend = regression.linear(points);
    const trendType =
      trend.equation[0] > 0 ? ("increasing" as const) : ("decreasing" as const);

    // Outlier Detection
    const zScores = validNumbers.map((v) => (v - mean) / stdDev);
    const outlierIndices = zScores
      .map((z, i) => (Math.abs(z) > 2 ? i : -1))
      .filter((i) => i !== -1);

    // Simple Forecast (last 3 points trend continuation)
    const lastPoints = validNumbers.slice(-3);
    const forecast = regression.linear(lastPoints.map((y, x) => [x, y]));
    const nextValue = forecast.predict(3)[1];

    return {
      trends: {
        type: trendType,
        slope: trend.equation[0],
        confidence: trend.r2,
      },
      outliers: {
        indices: outlierIndices,
        values: outlierIndices.map((i) => validNumbers[i]),
        zscore: outlierIndices.map((i) => zScores[i]),
      },
      forecast: {
        values: [nextValue],
        confidence: forecast.r2,
        range: {
          lower: [nextValue - stdDev],
          upper: [nextValue + stdDev],
        },
      },
      correlations: {
        pearson: 1, // For single dataset
        spearman: 1,
      },
      statistics: {
        basic: {
          mean,
          median,
          mode: ss.mode(validNumbers),
          stdDev,
          variance,
          skewness,
          kurtosis,
        },
        distribution: {
          // If we don't have enough data points for skewness calculation, default to "unknown"
          type: validNumbers.length < 3 ? "unknown" : (Math.abs(skewness) < 0.5 ? "normal" : "skewed"),
          parameters: { mean, stdDev },
          // Only use skewness-based calculation if we have enough data points
          goodnessOfFit: validNumbers.length < 3 ? 0.5 : (1 - Math.abs(skewness)),
        },
      },
    } as unknown as AnalyticsResult;
  };

  // Generate Insights
  const generateInsights = (analytics: AnalyticsResult): DataInsight[] => {
    const insights: DataInsight[] = [];

    // Trend Insight
    if (Math.abs(analytics.trends.slope) > 0.1) {
      insights.push({
        type: "trend",
        title: `${
          analytics.trends.type.charAt(0).toUpperCase() +
          analytics.trends.type.slice(1)
        } Trend Detected`,
        description: `The data shows a ${analytics.trends.type} trend with ${(
          analytics.trends.confidence * 100
        ).toFixed(1)}% confidence.`,
        confidence: analytics.trends.confidence,
        importance: analytics.trends.confidence > 0.7 ? "high" : "medium",
      });
    }

    // Outlier Insight
    if (analytics.outliers.indices.length > 0) {
      insights.push({
        type: "anomaly",
        title: "Outliers Detected",
        description: `Found ${analytics.outliers.indices.length} unusual values that deviate significantly from the norm.`,
        confidence: 0.9,
        importance: "high",
      });
    }

    // Distribution Insight - Only add if the distribution type is not "unknown"
    if (analytics.statistics.distribution.type !== "unknown") {
      insights.push({
        type: "pattern",
        title: `${
          analytics.statistics.distribution.type.charAt(0).toUpperCase() +
          analytics.statistics.distribution.type.slice(1)
        } Distribution`,
        description: `The data follows a ${
          analytics.statistics.distribution.type
        } distribution with ${(
          analytics.statistics.distribution.goodnessOfFit * 100
        ).toFixed(1)}% confidence.`,
        confidence: analytics.statistics.distribution.goodnessOfFit,
        importance: "medium",
      });
    } else if (analytics.statistics.basic.mean !== undefined) {
      // Provide a simpler insight when distribution type is unknown
      insights.push({
        type: "pattern",
        title: "Basic Statistical Summary",
        description: `The data has a mean of ${analytics.statistics.basic.mean.toFixed(2)} and a median of ${analytics.statistics.basic.median.toFixed(2)}.`,
        confidence: 0.8,
        importance: "low",
      });
    }

    return insights;
  };

  // Time Series Analysis
  const analyzeTimeSeries = (data: number[]): TimeSeriesAnalysis | null => {
    if (!data || data.length < 4) return null;

    try {
      // Filter out any NaN or invalid values
      const validData = data.filter((n) => typeof n === "number" && !isNaN(n));
      if (validData.length < 4) return null;
      
      // Simple trend analysis
      const points = validData.map((y, x) => [x, y]);
      
      // Handle potential errors in regression calculations
      let linearTrend;
      let expTrend;
      
      try {
        linearTrend = regression.linear(points);
      } catch (error) {
        console.warn("Error in linear regression calculation:", error);
        linearTrend = { r2: 0, string: "y = 0x + 0", predict: (x: number) => [x, 0] };
      }
      
      try {
        // Exponential regression requires all positive values
        const allPositive = validData.every(val => val > 0);
        expTrend = allPositive ? regression.exponential(points) : { r2: -1, string: "y = 0", predict: (x: number) => [x, 0] };
      } catch (error) {
        console.warn("Error in exponential regression calculation:", error);
        expTrend = { r2: -1, string: "y = 0", predict: (x: number) => [x, 0] };
      }

      // Use the trend with better R2
      const bestTrend =
        linearTrend.r2 > expTrend.r2
          ? { type: "linear" as const, ...linearTrend }
          : { type: "exponential" as const, ...expTrend };

      // Simple seasonality detection
      const diffs = validData.slice(1).map((v, i) => v - validData[i]);
      const crossings = diffs
        .slice(1)
        .map((v, i) => v * diffs[i] < 0)
        .filter(Boolean).length;
      const seasonalityStrength = crossings / validData.length;

      return {
        seasonality: {
          detected: seasonalityStrength > 0.2,
          period: Math.round(validData.length / (crossings + 1)),
          strength: seasonalityStrength,
        },
        trend: {
          type: bestTrend.type,
          equation: bestTrend.string,
          r2: bestTrend.r2,
        },
        decomposition: {
          trend: points.map((p) => bestTrend.predict(p[0])[1]),
          seasonal: new Array(validData.length).fill(0), // Simplified
          residual: validData.map((v, i) => v - bestTrend.predict(i)[1]),
        },
      };
    } catch (error) {
      console.error("Error in time series analysis:", error);
      return null;
    }
  };

  // Update the sortData function to handle undefined labels
  const sortData = (
    data: ChartData,
    order: "asc" | "desc" | "none"
  ): ChartData => {
    if (order === "none" || !data.labels) return data;

    // Create pairs of [label, index]
    const labelIndices = data.labels.map((label, index) => [label, index]);

    // Sort by label
    labelIndices.sort((a, b) => {
      const labelA = String(a[0]);
      const labelB = String(b[0]);
      return order === "asc"
        ? labelA.localeCompare(labelB)
        : labelB.localeCompare(labelA);
    });

    // Get sorted indices
    const sortedIndices = labelIndices.map((pair) => pair[1] as number);

    return {
      labels: sortedIndices.map((i) => data.labels![i]),
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        data: sortedIndices.map((i) => dataset.data[i]),
      })),
    };
  };

  // Update useEffect to handle sorting
  useEffect(() => {
    if (data) {
      const sorted = sortData(data, sortOrder);
      setSortedData(sorted);
    }
  }, [data, sortOrder]);

  // Update renderChart to use sortedData
  const renderChart = () => {
    let Component;
    const currentType = chartType;

    // Map special chart types to base components
    switch (currentType) {
      case "area":
      case "stackedArea":
      case "multiAxis":
      case "combo":
        Component = Line;
        break;
      case "horizontalBar":
      case "stackedBar":
        Component = Bar;
        break;
      default:
        Component =
          chartComponents[currentType as keyof typeof chartComponents] || Line;
    }

    const dataToUse = sortedData || data;
    const preparedData = prepareChartData(currentType, dataToUse as unknown as ImportedChartData, selectedColorScheme);
    const chartOptions = {
      ...getChartOptions(currentType),
      ...getChartTypeOptions(currentType),
    };

    // Force chart re-render with a unique key based on chart type and settings
    // This ensures the chart is properly reinitialized when settings change
    return (
      <Component
        key={`${currentType}-${selectedColorScheme}-${sortOrder}-${JSON.stringify(settings)}`}
        data={preparedData as any}
        options={chartOptions as any}
        ref={chartRef as any}
      />
    );
  };

  // Add logic to detect "All years" in the useEffect for chartData
  useEffect(() => {
    if (data.datasets[0]?.data) {
      // Detect if we're showing all years by checking the number of labels
      // Usually more than 12-15 data points means we're showing all years
      setIsShowingAllYears(Boolean(data.labels && data.labels.length > 15));
      
      const numericData = data.datasets[0].data.filter((d): d is number => typeof d === "number");
      const analyticsResult = performAnalytics(numericData);
      if (analyticsResult) {
        setAnalytics(analyticsResult);
        setInsights(generateInsights(analyticsResult));
        const numericData = data.datasets[0].data.filter((d): d is number => typeof d === "number");
        setTimeSeriesAnalysis(analyzeTimeSeries(numericData));
      }
    }
  }, [data]);

  // Update the getChartOptions function
  const getChartOptions = (type: ExtendedChartType) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: settings.enableAnimation ? undefined : false,
    plugins: {
      legend: {
        display: settings.showLegend,
        position: "top" as const,
        labels: {
          color: "white",
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: settings.chartTitle,
        color: "white",
        font: {
          size: 18,
          weight: "bold" as const,
        },
        padding: { top: 20, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            if (type === 'bubble') {
              const value = context.raw;
              return `${context.dataset.label}: (x: ${value.x}, y: ${value.y}, size: ${value.r})`;
            }
            if (type === 'scatter') {
              const value = context.raw;
              return `${context.dataset.label}: (x: ${value.x}, y: ${value.y})`;
            }
            return `${context.dataset.label}: ${context.formattedValue}`;
          }
        }
      }
    },
    scales: type === "radar" ? {
      r: {
        ticks: { color: "white" },
        grid: {
          display: settings.showGrid,
          color: "rgba(255, 255, 255, 0.1)",
        },
        pointLabels: { color: "white" },
      },
    } : {
      x: {
        type: type === 'scatter' || type === 'bubble' ? 'linear' : 'category',
        title: {
          display: true,
          text: settings.xAxisLabel,
          color: "white",
          font: { size: 14 },
          padding: { top: 10 }
        },
        ticks: {
          color: "white",
          maxRotation: 45,
          minRotation: 45,
          padding: 8,
        },
        grid: {
          display: settings.showGrid,
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: settings.yAxisLabel,
          color: "white",
          font: { size: 14 },
          padding: { bottom: 10 },
        },
        ticks: { 
          color: "white",
          padding: 8,
        },
        grid: {
          display: settings.showGrid,
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
    elements: {
      point: {
        radius: type === 'scatter' ? 6 : 4,
        hoverRadius: type === 'scatter' ? 8 : 6,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      line: {
        tension: 0.4,
      },
    },
  });

  const handleDownload = () => {
    try {
      console.log("Download initiated, chart reference:", chartRef.current ? "exists" : "null");
      
      // First try to get canvas from chart instance
      if (chartRef.current && chartRef.current.canvas) {
        console.log("Using chart.js canvas reference");
        const canvas = chartRef.current.canvas;
        
        // Create and trigger a download link
        const link = document.createElement("a");
        link.download = `${settings.chartTitle || 'chart'}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Next try to find canvas in DOM
      console.log("Chart.js canvas unavailable, trying DOM query");
      const chartContainer = document.querySelector(".chart-container");
      const canvasElement = chartContainer?.querySelector("canvas");
      
      if (canvasElement) {
        console.log("Using DOM queried canvas");
        const link = document.createElement("a");
        link.download = `${settings.chartTitle || 'chart'}.png`;
        link.href = canvasElement.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // If no canvas was found, show error
      console.error("No canvas element found for download");
      alert("Unable to download chart: Could not find canvas element");
      
    } catch (error) {
      console.error("Error downloading chart:", error);
      alert(`Unable to download chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportData = () => {
    const dataToExport = filteredChartData || data;
    if (!dataToExport.labels) return;
    
    const csvContent = [
      // Header
      ["Category", ...dataToExport.datasets.map((ds) => ds.label)].join(","),
      // Data rows
      ...dataToExport.labels.map((label, i) =>
        [label, ...dataToExport.datasets.map((ds) => ds.data[i])].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const filterSuffix = selectedTimeFilter !== "all" ? `_${selectedTimeFilter}` : "";
    link.download = `${settings.chartTitle}${filterSuffix}.csv`;
    link.click();
  };

  const getChartConfig = (type: ExtendedChartType): ChartType => {
    switch (type) {
      case 'horizontalBar':
        return 'bar';
      case 'stackedBar':
        return 'bar';
      case 'area':
        return 'line';
      case 'stackedArea':
        return 'line';
      case 'multiAxis':
        return 'line';
      case 'combo':
        return 'line';
      default:
        return type as ChartType;
    }
  };

  // Apply prediction data to chart if available
  useEffect(() => {
    if (predictionResult && chartRef.current && data.labels) {
      // Update the chart to include prediction data
      const originalLabels = [...data.labels];
      const lastLabel = originalLabels[originalLabels.length - 1];
      
      // Create new labels for predictions (e.g., "Next 1", "Next 2", etc.)
      const predictionLabels = predictionResult.forecast_values.map((_, i) => {
        // If last label is a date, attempt to increment it
        if (lastLabel && !isNaN(Date.parse(lastLabel.toString()))) {
          const lastDate = new Date(lastLabel.toString());
          const newDate = new Date(lastDate);
          newDate.setDate(lastDate.getDate() + (i + 1));
          return newDate.toLocaleDateString();
        }
        // Otherwise use generic "Next #" labels
        return `Next ${i + 1}`;
      });
      
      // Combine original and prediction datasets
      const newData = {
        ...data,
        labels: [...originalLabels, ...predictionLabels],
        datasets: [
          // Keep original dataset
          {
            ...data.datasets[0],
            label: `${data.datasets[0].label || 'Actual'}`
          },
          // Add prediction dataset
          {
            label: 'Prediction',
            data: [...Array(originalLabels.length).fill(null), ...predictionResult.forecast_values],
            borderColor: '#10B981', // Emerald green
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBackgroundColor: '#10B981',
            fill: false,
            tension: 0.4 // Add some curve to the line
          }
        ]
      };
      
      // Update chart with new data
      chartRef.current.data = newData as any;
      chartRef.current.update();
    }
  }, [predictionResult, chartRef, data]);

  // Function to detect time periods in labels with improved logic
  const detectTimePeriods = (labels: string[]): { type: "year" | "month" | "week" | "none", options: string[] } => {
    if (!labels || labels.length === 0) return { type: "none", options: [] };

    const yearPattern = /\b(19|20)\d{2}\b/;
    const monthYearPattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s*(19|20)\d{2}\b/i;
    const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;

    let dates: Date[] = [];
    let years = new Set<string>();
    let months = new Set<string>();
    let weeks = new Set<string>();

    // First pass: extract all valid dates and time periods
    labels.forEach(label => {
      const labelStr = String(label);
      
      // Try to parse as date first
      const parsedDate = new Date(labelStr);
      if (!isNaN(parsedDate.getTime())) {
        dates.push(parsedDate);
        years.add(parsedDate.getFullYear().toString());
        months.add(`${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`);
        
        // Get week of year
        const weekNumber = getWeekNumber(parsedDate);
        weeks.add(`Week ${weekNumber} ${parsedDate.getFullYear()}`);
        return;
      }

      // Check for month-year pattern
      const monthYearMatch = labelStr.match(monthYearPattern);
      if (monthYearMatch) {
        const monthDate = new Date(labelStr);
        if (!isNaN(monthDate.getTime())) {
          dates.push(monthDate);
          months.add(labelStr.trim());
          const yearMatch = labelStr.match(yearPattern);
          if (yearMatch) {
            years.add(yearMatch[0]);
          }
        }
        return;
      }

      // Check for year pattern
      const yearMatch = labelStr.match(yearPattern);
      if (yearMatch) {
        years.add(yearMatch[0]);
        const yearDate = new Date(`${yearMatch[0]}-01-01`);
        dates.push(yearDate);
        return;
      }

      // Check for date pattern
      const dateMatch = labelStr.match(datePattern);
      if (dateMatch) {
        const parsedDate = new Date(dateMatch[0]);
        if (!isNaN(parsedDate.getTime())) {
          dates.push(parsedDate);
          years.add(parsedDate.getFullYear().toString());
          months.add(`${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`);
          
          const weekNumber = getWeekNumber(parsedDate);
          weeks.add(`Week ${weekNumber} ${parsedDate.getFullYear()}`);
        }
      }
    });

    // If we couldn't extract any dates, return none
    if (dates.length === 0) return { type: "none", options: [] };

    // Calculate the data span
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    const spanInDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const spanInYears = spanInDays / 365.25;

    console.log(`Data span: ${spanInDays} days (${spanInYears.toFixed(1)} years)`);
    console.log(`Years: ${years.size}, Months: ${months.size}, Weeks: ${weeks.size}`);

    // Decision logic based on data span
    if (spanInYears >= 10) {
      // 10+ years of data: filter by year
      return { type: "year", options: Array.from(years).sort() };
    } else if (spanInYears >= 2 || (spanInYears >= 1 && months.size > 12)) {
      // 2+ years OR 1+ year with many months: filter by year
      return { type: "year", options: Array.from(years).sort() };
    } else if (spanInDays >= 180) {
      // 6 months to 2 years: filter by month
      return { type: "month", options: Array.from(months).sort() };
    } else if (spanInDays >= 14 && weeks.size > 1) {
      // 2 weeks to 6 months: filter by week
      return { type: "week", options: Array.from(weeks).sort() };
    } else if (years.size > 1) {
      // Multiple years detected: filter by year
      return { type: "year", options: Array.from(years).sort() };
    } else if (months.size > 1) {
      // Multiple months detected: filter by month
      return { type: "month", options: Array.from(months).sort() };
    }

    return { type: "none", options: [] };
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.ceil(dayOfYear / 7);
  };

  // Function to filter data based on selected time period
  const filterDataByTime = (data: ChartData, filter: string, filterType: "year" | "month" | "week"): ChartData => {
    if (filter === "all" || !data.labels) return data;

    const filteredIndices: number[] = [];
    
    data.labels.forEach((label, index) => {
      const labelStr = String(label);
      
      if (filterType === "year") {
        if (labelStr.includes(filter)) {
          filteredIndices.push(index);
        }
      } else if (filterType === "month") {
        if (labelStr.includes(filter) || labelStr === filter) {
          filteredIndices.push(index);
        }
      } else if (filterType === "week") {
        // For week filtering, check if the date falls within the selected week
        const parsedDate = new Date(labelStr);
        if (!isNaN(parsedDate.getTime())) {
          const weekNumber = getWeekNumber(parsedDate);
          const weekString = `Week ${weekNumber} ${parsedDate.getFullYear()}`;
          if (weekString === filter) {
            filteredIndices.push(index);
          }
        }
      }
    });

    return {
      labels: filteredIndices.map(i => data.labels![i]),
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        data: filteredIndices.map(i => dataset.data[i])
      }))
    };
  };

  // Update useEffect to detect time periods and set up filtering
  useEffect(() => {
    if (data && data.labels) {
      const { type, options } = detectTimePeriods(data.labels);
      setTimeFilterType(type);
      setAvailableTimeOptions(options);
      setSelectedTimeFilter("all");
      
      // Set initial filtered data
      setFilteredChartData(data);
    }
  }, [data]);

  // Update filtered data when filter changes
  useEffect(() => {
    if (data && timeFilterType !== "none") {
      const filtered = filterDataByTime(data, selectedTimeFilter, timeFilterType);
      setFilteredChartData(filtered);
    } else {
      setFilteredChartData(data);
    }
  }, [data, selectedTimeFilter, timeFilterType]);

  // Update useEffect to handle sorting with filtered data
  useEffect(() => {
    if (filteredChartData) {
      const sorted = sortData(filteredChartData, sortOrder);
      setSortedData(sorted);
    }
  }, [filteredChartData, sortOrder]);

  // Update useEffect to use filtered data for analytics
  useEffect(() => {
    if (filteredChartData?.datasets[0]?.data) {
      // Detect if we're showing all years by checking the number of labels
      setIsShowingAllYears(Boolean(filteredChartData.labels && filteredChartData.labels.length > 15));
      
      const numericData = filteredChartData.datasets[0].data.filter((d): d is number => typeof d === "number");
      const analyticsResult = performAnalytics(numericData);
      if (analyticsResult) {
        setAnalytics(analyticsResult);
        setInsights(generateInsights(analyticsResult));
        setTimeSeriesAnalysis(analyzeTimeSeries(numericData));
      }
    }
  }, [filteredChartData]);

  return (
    <motion.div
      className="flex-grow space-y-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-gray-900 rounded-xl overflow-hidden shadow-lg relative border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chart Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Data Visualization
          </h2>
          <div className="flex space-x-2">
            <motion.button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Download as PNG"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={handleExportData}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Data as CSV"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Chart Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded-lg transition-colors ${
                showInsights ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Show AI Insights"
            >
              <Brain className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() =>
                setSettings((s) => ({ ...s, showTrendline: !s.showTrendline }))
              }
              className={`p-2 rounded-lg transition-colors ${
                settings.showTrendline
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Show Trendline"
            >
              <TrendingUp className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() =>
                setSettings((s) => ({ ...s, showForecast: !s.showForecast }))
              }
              className={`p-2 rounded-lg transition-colors ${
                settings.showForecast
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Show Forecast"
            >
              <Clock className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={settings.chartTitle}
                onChange={(e) =>
                  setSettings({ ...settings, chartTitle: e.target.value })
                }
                placeholder="Chart Title"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                value={settings.xAxisLabel}
                onChange={(e) =>
                  setSettings({ ...settings, xAxisLabel: e.target.value })
                }
                placeholder="X-Axis Label"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                value={settings.yAxisLabel}
                onChange={(e) =>
                  setSettings({ ...settings, yAxisLabel: e.target.value })
                }
                placeholder="Y-Axis Label"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) =>
                    setSettings({ ...settings, showGrid: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>Show Grid</span>
              </label>
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.showLegend}
                  onChange={(e) =>
                    setSettings({ ...settings, showLegend: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>Show Legend</span>
              </label>
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.enableAnimation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableAnimation: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>Enable Animation</span>
              </label>
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {showInsights && insights.length > 0 && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {insight.type === "trend" && (
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    )}
                    {insight.type === "anomaly" && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    {insight.type === "pattern" && (
                      <Brain className="w-4 h-4 text-purple-400" />
                    )}
                    <h4 className="text-white font-medium">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400">Confidence:</div>
                    <div className="flex-1 bg-gray-600 rounded-full h-1">
                      <div
                        className="bg-blue-500 rounded-full h-1"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Time Series Analysis Panel */}
        {timeSeriesAnalysis && chartType === "line" && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Time Series Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-white font-medium mb-2">Trend</h4>
                <p className="text-gray-300 text-sm">
                  Type: {timeSeriesAnalysis.trend.type}
                  <br />
                  Equation: {timeSeriesAnalysis.trend.equation}
                  <br />
                  R²: {timeSeriesAnalysis.trend.r2.toFixed(3)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-white font-medium mb-2">Seasonality</h4>
                <p className="text-gray-300 text-sm">
                  {timeSeriesAnalysis.seasonality.detected ? (
                    <>
                      Period: {timeSeriesAnalysis.seasonality.period} points
                      <br />
                      Strength:{" "}
                      {(timeSeriesAnalysis.seasonality.strength * 100).toFixed(
                        1
                      )}
                      %
                    </>
                  ) : (
                    "No significant seasonality detected"
                  )}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-white font-medium mb-2">
                  Quality Metrics
                </h4>
                <p className="text-gray-300 text-sm">
                  Trend Strength:{" "}
                  {(timeSeriesAnalysis.trend.r2 * 100).toFixed(1)}%<br />
                  Residual Variation:{" "}
                  {ss
                    .standardDeviation(
                      timeSeriesAnalysis.decomposition.residual
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="p-6">
          <div className="chart-container relative bg-black rounded-lg p-4 border border-gray-700 h-[500px]">
            {renderChart()}
          </div>
        </div>

        {/* Chart Type Controls */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Object.entries(chartComponents).map(([type, _]) => {
              const Icon =
                chartIcons[type as keyof typeof chartIcons] || Activity;
              return (
                <motion.button
                  key={type}
                  onClick={() => setChartType(type as ExtendedChartType)}
                  className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 text-sm ${
                    chartType === type
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{type}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Color Schemes */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Object.keys(colorSchemes).map((scheme) => (
              <motion.button
                key={scheme}
                onClick={() =>
                  setSelectedColorScheme(scheme as keyof typeof colorSchemes)
                }
                className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 text-sm ${
                  selectedColorScheme === scheme
                    ? "bg-purple-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Palette className="w-4 h-4" />
                <span className="capitalize">{scheme}</span>
              </motion.button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 justify-center">
            <motion.button
              onClick={() => setSortOrder(sortOrder === "asc" ? "none" : "asc")}
              className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 text-sm ${
                sortOrder === "asc"
                  ? "bg-green-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SortAsc className="w-4 h-4" />
              <span>Sort Asc</span>
            </motion.button>
            <motion.button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "none" : "desc")
              }
              className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 text-sm ${
                sortOrder === "desc"
                  ? "bg-green-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SortDesc className="w-4 h-4" />
              <span>Sort Desc</span>
            </motion.button>
          </div>
        </div>

        {/* Time Filter Panel */}
        {timeFilterType !== "none" && availableTimeOptions.length > 0 && (
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Period Filter ({timeFilterType === "year" ? "Years" : timeFilterType === "month" ? "Months" : "Weeks"})
            </h3>
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => setSelectedTimeFilter("all")}
                className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 text-sm ${
                  selectedTimeFilter === "all"
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-4 h-4" />
                <span>Show All Data</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                  {data.labels?.length || 0} points
                </span>
              </motion.button>
              
              {availableTimeOptions.map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setSelectedTimeFilter(option)}
                  className={`px-3 py-2 rounded-lg text-white transition-colors text-sm ${
                    selectedTimeFilter === option
                      ? "bg-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            
            {selectedTimeFilter !== "all" && (
              <div className="mt-3 text-sm text-gray-400">
                Showing {filteredChartData?.labels?.length || 0} data points for {selectedTimeFilter}
                {timeFilterType === "year" && ` (${filteredChartData?.labels?.length || 0} entries from ${selectedTimeFilter})`}
                {timeFilterType === "month" && ` (${filteredChartData?.labels?.length || 0} entries from ${selectedTimeFilter})`}
                {timeFilterType === "week" && ` (${filteredChartData?.labels?.length || 0} entries from ${selectedTimeFilter})`}
              </div>
            )}
            
            {/* Data span info */}
            <div className="mt-2 text-xs text-gray-500">
              Filter automatically selected based on data span: {timeFilterType === "year" ? "Multi-year dataset" : timeFilterType === "month" ? "Monthly dataset" : "Weekly dataset"}
            </div>
          </div>
        )}

        {!isFullScreen && onFullScreen && (
          <button
            onClick={onFullScreen}
            className="absolute top-2 right-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors z-10"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {isFullScreen && onClose && (
          <div className="absolute top-2 right-2 p-3 z-20">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="Close Fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
