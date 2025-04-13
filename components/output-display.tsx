"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from "react-chartjs-2";
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
} from "lucide-react";
import regression from "regression";
import * as ss from "simple-statistics";
import { AnalyticsResult, DataInsight } from "@/types";
import { TimeSeriesAnalysis } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

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
  chartData: ChartData;
  onFullScreen?: () => void;
  isFullScreen?: boolean;
}

export default function OutputDisplay({ chartData, onFullScreen, isFullScreen = false }: OutputDisplayProps) {
  const [chartType, setChartType] = useState<ExtendedChartType>("bar");
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorSchemeKey>("vibrant");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [showSettings, setShowSettings] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>({
    showGrid: true,
    showLegend: true,
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
    const skewness = ss.sampleSkewness(validNumbers);
    const kurtosis = ss.sampleKurtosis(validNumbers);

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
          type: Math.abs(skewness) < 0.5 ? "normal" : "skewed",
          parameters: { mean, stdDev },
          goodnessOfFit: 1 - Math.abs(skewness),
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

    // Distribution Insight
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

    return insights;
  };

  // Time Series Analysis
  const analyzeTimeSeries = (data: number[]): TimeSeriesAnalysis | null => {
    if (data.length < 4) return null;

    // Simple trend analysis
    const points = data.map((y, x) => [x, y]);
    const linearTrend = regression.linear(points);
    const expTrend = regression.exponential(points);

    // Use the trend with better R2
    const bestTrend =
      linearTrend.r2 > expTrend.r2
        ? { type: "linear" as const, ...linearTrend }
        : { type: "exponential" as const, ...expTrend };

    // Simple seasonality detection
    const diffs = data.slice(1).map((v, i) => v - data[i]);
    const crossings = diffs
      .slice(1)
      .map((v, i) => v * diffs[i] < 0)
      .filter(Boolean).length;
    const seasonalityStrength = crossings / data.length;

    return {
      seasonality: {
        detected: seasonalityStrength > 0.2,
        period: Math.round(data.length / (crossings + 1)),
        strength: seasonalityStrength,
      },
      trend: {
        type: bestTrend.type,
        equation: bestTrend.string,
        r2: bestTrend.r2,
      },
      decomposition: {
        trend: points.map((p) => bestTrend.predict(p[0])[1]),
        seasonal: new Array(data.length).fill(0), // Simplified
        residual: data.map((v, i) => v - bestTrend.predict(i)[1]),
      },
    };
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
    if (chartData) {
      const sorted = sortData(chartData, sortOrder);
      setSortedData(sorted);
    }
  }, [chartData, sortOrder]);

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

    const dataToUse = sortedData || chartData;
    const preparedData = prepareChartData(currentType, dataToUse as unknown as ImportedChartData, selectedColorScheme);
    const chartOptions = {
      ...getChartOptions(currentType),
      ...getChartTypeOptions(currentType),
    };

    return (
      <Component
        key={`${currentType}-${selectedColorScheme}-${sortOrder}`}
        data={preparedData as any}
        options={chartOptions as any}
        ref={chartRef as any}
      />
    );
  };

  // Add logic to detect "All years" in the useEffect for chartData
  useEffect(() => {
    if (chartData.datasets[0]?.data) {
      // Detect if we're showing all years by checking the number of labels
      // Usually more than 12-15 data points means we're showing all years
      setIsShowingAllYears(Boolean(chartData.labels && chartData.labels.length > 15));
      
      const numericData = chartData.datasets[0].data.filter((d): d is number => typeof d === "number");
      const analyticsResult = performAnalytics(numericData);
      if (analyticsResult) {
        setAnalytics(analyticsResult);
        setInsights(generateInsights(analyticsResult));
        const numericData = chartData.datasets[0].data.filter((d): d is number => typeof d === "number");
        setTimeSeriesAnalysis(analyzeTimeSeries(numericData));
      }
    }
  }, [chartData]);

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
          padding: { top: 10 },
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
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      if (chartInstance && chartInstance.canvas) {
        const canvas = chartInstance.canvas;
        const link = document.createElement("a");
        link.download = `${settings.chartTitle}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        console.error("Could not get chart instance or canvas from ref.");
      }
    } else {
      console.error("Chart ref is not available.");
    }
  };

  const handleExportData = () => {
    if (!chartData.labels) return;
    
    const csvContent = [
      // Header
      ["Category", ...chartData.datasets.map((ds) => ds.label)].join(","),
      // Data rows
      ...chartData.labels.map((label, i) =>
        [label, ...chartData.datasets.map((ds) => ds.data[i])].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${settings.chartTitle}.csv`;
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

  return (
    <motion.div
      className="flex-grow space-y-8 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl overflow-hidden shadow-lg relative border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chart Header */}
        <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700 flex justify- items-end space-x-4">
          <h2 className="text-2xl font-semibold text-blue-400">
            Data Visualization
          </h2>
          <div className="pl-64 flex space-x-2">
            <motion.button
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Download as PNG"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={handleExportData}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Data as CSV"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${
                showSettings ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Chart Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded-full ${
                showInsights ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
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
              className={`p-2 rounded-full ${
                settings.showTrendline
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
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
              className={`p-2 rounded-full ${
                settings.showForecast
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
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
          <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={settings.chartTitle}
                onChange={(e) =>
                  setSettings({ ...settings, chartTitle: e.target.value })
                }
                placeholder="Chart Title"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                value={settings.xAxisLabel}
                onChange={(e) =>
                  setSettings({ ...settings, xAxisLabel: e.target.value })
                }
                placeholder="X-Axis Label"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                value={settings.yAxisLabel}
                onChange={(e) =>
                  setSettings({ ...settings, yAxisLabel: e.target.value })
                }
                placeholder="Y-Axis Label"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) =>
                    setSettings({ ...settings, showGrid: e.target.checked })
                  }
                  className="form-checkbox"
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
                  className="form-checkbox"
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
                  className="form-checkbox"
                />
                <span>Enable Animation</span>
              </label>
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {showInsights && insights.length > 0 && (
          <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800 bg-opacity-50 rounded-lg p-4"
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
                    <h4 className="text-white font-semibold">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm">{insight.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="text-xs text-gray-400">Confidence:</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-1">
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
          <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Time Series Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Trend</h4>
                <p className="text-gray-300 text-sm">
                  Type: {timeSeriesAnalysis.trend.type}
                  <br />
                  Equation: {timeSeriesAnalysis.trend.equation}
                  <br />
                  R²: {timeSeriesAnalysis.trend.r2.toFixed(3)}
                </p>
              </div>
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Seasonality</h4>
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
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">
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

        {/* Chart Container with conditional styling for horizontal scrolling */}
        <div className="p-6 bg-gradient-to-br from-gray-900/90 to-black/90 overflow-hidden rounded-2xl">
          <div className={`${(isShowingAllYears && (chartType === 'bar' || chartType === 'horizontalBar' || chartType === 'stackedBar')) ? 'overflow-x-auto' : ''}`}>
            <div className={`relative bg-black/40 p-6 border border-white/5 ${(isShowingAllYears && (chartType === 'bar' || chartType === 'horizontalBar' || chartType === 'stackedBar')) ? 'min-w-[12800px]' : ''} h-[500px]`}>
              {renderChart()}
            </div>
          </div>
        </div>

        {/* Data Controls */}
        <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700">
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={() => setSortOrder(sortOrder === "asc" ? "none" : "asc")}
              className={`px-4 py-2 rounded-full text-white transition-colors flex items-center space-x-2 ${
                sortOrder === "asc"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SortAsc className="w-4 h-4" />
              <span>Sort Ascending</span>
            </motion.button>
            <motion.button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "none" : "desc")
              }
              className={`px-4 py-2 rounded-full text-white transition-colors flex items-center space-x-2 ${
                sortOrder === "desc"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SortDesc className="w-4 h-4" />
              <span>Sort Descending</span>
            </motion.button>
          </div>
        </div>

        {/* Color Scheme Buttons */}
        <div className="p-4 bg-black bg-opacity-30 border-b border-gray-700">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(colorSchemes).map((scheme) => (
              <motion.button
                key={scheme}
                onClick={() =>
                  setSelectedColorScheme(scheme as keyof typeof colorSchemes)
                }
                className={`px-4 py-2 rounded-full text-white transition-colors flex items-center space-x-2 ${
                  selectedColorScheme === scheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Palette className="w-4 h-4" />
                <span className="capitalize">{scheme}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chart Type Buttons */}
        <div className="p-4 bg-black bg-opacity-30 relative z-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(chartComponents).map(([type, _]) => {
              const Icon =
                chartIcons[type as keyof typeof chartIcons] || Activity;
              return (
                <motion.button
                  key={type}
                  onClick={() => setChartType(type as ExtendedChartType)}
                  className={`px-4 py-2 rounded-full text-white transition-colors flex items-center space-x-2 ${
                    chartType === type
                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{type}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {!isFullScreen && onFullScreen && (
          <button
            onClick={onFullScreen}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="View Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
