"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  BarChart3,
  Brain,
  TrendingUp,
  Loader2,
  Mic,
  Database,
  FileText,
  Activity,
  PieChart,
  LineChart,
  AlertCircle,
  ArrowUp,
  Lightbulb,
  Paperclip,
  Copy,
  Check,
  PanelRightClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSidebar } from "@/app/dashboard/layout";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ChatUploadModal from "./chat-upload-modal";
import { useChatSessions } from "@/hooks/useChatSessions";

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
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  analysis_results?: any;
  vector_context_used?: boolean;
  context_summary?: {
    similar_analyses_count: number;
    suggested_sources: string[];
    suggested_analysis_types: string[];
  };
  dataContext?: {
    fileName: string;
    rowCount: number;
    dataType: string;
    columns: string[];
  };
}

interface VectorContext {
  similar_analyses: Array<{
    id: string;
    score: number;
    analysis_type: string;
    key_insights: string[];
    session_id: string;
  }>;
  suggested_data_sources: string[];
  suggested_analysis_types: string[];
  has_context: boolean;
}

interface ChatData {
  data: any[];
  metadata: {
    filename: string;
    rowCount: number;
    columns: string[];
    fileSize: number;
    uploadedAt: string;
  };
}

interface ChartData {
  type:
    | "line"
    | "bar"
    | "pie"
    | "doughnut"
    | "scatter"
    | "area"
    | "histogram"
    | "radar"
    | "polarArea"
    | "bubble";
  title: string;
  data: {
    labels?: string[];
    datasets: Array<{
      label?: string;
      data: any[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
      pointBorderWidth?: number;
    }>;
  };
}

function useVectorContext(query: string, sessionId: string | null) {
  const [context, setContext] = useState<VectorContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 20 || !sessionId) {
      setContext(null);
      return;
    }

    const getContext = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/vector/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            session_id: sessionId,
            user_id: "user_123",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.context && data.context.has_context) {
            setContext(data.context);
          } else {
            setContext(null);
          }
        }
      } catch (error) {
        console.error("Error fetching vector context:", error);
        setContext(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(getContext, 1000);
    return () => clearTimeout(timer);
  }, [query, sessionId]);

  return { context, isLoading };
}

const normalizeChartData = (chartConfig: any): ChartData | null => {
  try {
    console.log("🔄 Normalizing chart data:", chartConfig);

    // ✅ Validate basics
    if (
      !chartConfig ||
      typeof chartConfig !== "object" ||
      Object.keys(chartConfig).length === 0
    ) {
      console.error("❌ Invalid chart config");
      return null;
    }

    if (!chartConfig.type) {
      console.error("❌ Chart missing type field");
      return null;
    }

    const colors = [
      { bg: "rgba(54, 162, 235, 0.8)", border: "rgba(54, 162, 235, 1)" },
      { bg: "rgba(255, 99, 132, 0.8)", border: "rgba(255, 99, 132, 1)" },
      { bg: "rgba(75, 192, 192, 0.8)", border: "rgba(75, 192, 192, 1)" },
      { bg: "rgba(255, 206, 86, 0.8)", border: "rgba(255, 206, 86, 1)" },
      { bg: "rgba(153, 102, 255, 0.8)", border: "rgba(153, 102, 255, 1)" },
      { bg: "rgba(255, 159, 64, 0.8)", border: "rgba(255, 159, 64, 1)" },
    ];

    if (
      chartConfig.data &&
      chartConfig.data.labels &&
      chartConfig.data.datasets
    ) {
      console.log("✅ Chart in correct format");
      return {
        type: chartConfig.type,
        title: chartConfig.title || "Chart",
        data: {
          labels: chartConfig.data.labels,
          datasets: chartConfig.data.datasets.map((ds: any, idx: number) => ({
            ...ds,
            backgroundColor:
              ds.backgroundColor ||
              (chartConfig.type === "bar"
                ? colors[idx % colors.length].bg
                : colors[idx % colors.length].bg.replace("0.8", "0.3")),
            borderColor: ds.borderColor || colors[idx % colors.length].border,
            borderWidth: ds.borderWidth || 3,
            pointRadius: chartConfig.type === "scatter" ? 6 : 4,
            pointHoverRadius: chartConfig.type === "scatter" ? 8 : 6,
            pointBackgroundColor: colors[idx % colors.length].border,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            tension: 0.4,
            fill: chartConfig.type === "area" || ds.fill,
          })),
        },
      };
    }


    if ((chartConfig.x || chartConfig.labels) && chartConfig.series) {
      console.log("🔧 Converting series format to correct format");

      const xLabels = chartConfig.x || chartConfig.labels || [];
      const series = chartConfig.series || [];

      if (
        !Array.isArray(xLabels) ||
        !Array.isArray(series) ||
        series.length === 0
      ) {
        console.error("❌ Invalid x labels or series");
        return null;
      }

      return {
        type: chartConfig.type,
        title: chartConfig.title || "Chart",
        data: {
          labels: xLabels,
          datasets: series.map((s: any, idx: number) => {
            const seriesData = s.data || s.y || [];
            return {
              label: s.name || `Series ${idx + 1}`,
              data: seriesData,
              backgroundColor:
                chartConfig.type === "bar"
                  ? colors[idx % colors.length].bg
                  : colors[idx % colors.length].bg.replace("0.8", "0.3"),
              borderColor: colors[idx % colors.length].border,
              borderWidth: 3,
              pointRadius: chartConfig.type === "scatter" ? 6 : 4,
              pointHoverRadius: chartConfig.type === "scatter" ? 8 : 6,
              pointBackgroundColor: colors[idx % colors.length].border,
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: chartConfig.type === "area",
            };
          }),
        },
      };
    }

    // ✅ CASE 3: Legacy format { type, labels, datasets }
    if (chartConfig.labels && chartConfig.datasets) {
      console.log("🔧 Converting legacy format");
      return {
        type: chartConfig.type,
        title: chartConfig.title || "Chart",
        data: {
          labels: chartConfig.labels,
          datasets: chartConfig.datasets.map((ds: any, idx: number) => ({
            ...ds,
            backgroundColor:
              ds.backgroundColor || colors[idx % colors.length].bg,
            borderColor: ds.borderColor || colors[idx % colors.length].border,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          })),
        },
      };
    }

    console.error("❌ Unknown chart format:", {
      hasData: !!chartConfig.data,
      hasSeries: !!chartConfig.series,
      hasX: !!chartConfig.x,
      hasLabels: !!chartConfig.labels,
      hasDatasets: !!chartConfig.datasets,
    });
    return null;
  } catch (error) {
    console.error("❌ Error normalizing chart:", error);
    return null;
  }
};

const detectAndRenderCharts = (
  content: string
): { content: string; charts: ChartData[] } => {
  const charts: ChartData[] = [];
  let processedContent = content;

  const chartPattern = /```chart\s*\n([\s\S]*?)\n```/g;
  let match;
  let matchIndex = 0;

  while ((match = chartPattern.exec(content)) !== null) {
    matchIndex++;
    try {
      let chartJsonStr = match[1].trim();


      chartJsonStr = chartJsonStr.replace(/\/\/.*$/gm, '');
      

      chartJsonStr = chartJsonStr.replace(/\/\*[\s\S]*?\*\//g, '');
     
      chartJsonStr = chartJsonStr.replace(/,(\s*[}\]])/g, '$1');
      

      chartJsonStr = chartJsonStr.trim();


      if (
        !chartJsonStr ||
        chartJsonStr === "{}" ||
        /^\s*\{\s*\}\s*$/.test(chartJsonStr)
      ) {
        console.warn(`⚠️ Empty chart #${matchIndex}, removing`);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }

      if (!chartJsonStr.startsWith("{") || !chartJsonStr.endsWith("}")) {
        console.warn(`⚠️ Invalid JSON structure #${matchIndex}, removing`);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }

      let chartConfig;
      try {
        chartConfig = JSON.parse(chartJsonStr);
      } catch (parseError) {
        console.error(`❌ JSON parse failed #${matchIndex}:`, parseError);
        console.error("JSON was:", chartJsonStr.slice(0, 200));
        console.error("Full JSON:", chartJsonStr);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }


      if (
        !chartConfig ||
        typeof chartConfig !== "object" ||
        Array.isArray(chartConfig)
      ) {
        console.warn(`⚠️ Invalid object type #${matchIndex}`);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }

      if (Object.keys(chartConfig).length === 0) {
        console.warn(`⚠️ Empty object #${matchIndex}`);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }

      // ✅ Validate required fields
      if (!chartConfig.type) {
        console.warn(`⚠️ Chart missing type field #${matchIndex}`);
        processedContent = processedContent.replace(match[0], "");
        continue;
      }

      // ✅ Normalize to correct format
      const normalizedChart = normalizeChartData(chartConfig);

      if (normalizedChart) {
        // ✅ Validate data exists and is meaningful
        const hasLabels =
          normalizedChart.data.labels && normalizedChart.data.labels.length > 0;
        const hasDatasets =
          normalizedChart.data.datasets &&
          normalizedChart.data.datasets.length > 0;
        const hasData = normalizedChart.data.datasets.some(
          (ds) =>
            ds.data &&
            Array.isArray(ds.data) &&
            ds.data.length > 0 &&
            ds.data.some(
              (val) => val !== null && val !== undefined && !isNaN(Number(val))
            )
        );

        if (
          hasDatasets &&
          hasData &&
          (hasLabels || normalizedChart.type === "scatter")
        ) {
          charts.push(normalizedChart);
          processedContent = processedContent.replace(
            match[0],
            "[CHART_PLACEHOLDER]"
          );
          console.log(`✅ Chart #${matchIndex} added:`, {
            type: normalizedChart.type,
            title: normalizedChart.title,
            labels: normalizedChart.data.labels?.length || 0,
            datasets: normalizedChart.data.datasets.length,
            firstDatasetSize: normalizedChart.data.datasets[0]?.data?.length,
            hasValidData: hasData,
          });
        } else {
          console.warn(`⚠️ Chart #${matchIndex} has no valid data:`, {
            hasLabels,
            hasDatasets,
            hasData,
            chartType: normalizedChart.type,
          });
          processedContent = processedContent.replace(match[0], "");
        }
      } else {
        console.warn(`⚠️ Failed to normalize chart #${matchIndex}`);
        processedContent = processedContent.replace(match[0], "");
      }
    } catch (error) {
      console.error(`❌ Error processing chart #${matchIndex}:`, error);
      processedContent = processedContent.replace(match[0], "");
    }
  }

  if (charts.length > 0) {
    console.log(`📊 Successfully processed ${charts.length} chart(s)`);
  } else if (content.includes("```chart")) {
    console.warn("⚠️ Found ```chart blocks but extracted 0 valid charts");
  }

  return { content: processedContent, charts };
};

// ✅ FIX: Enhanced AIGeneratedChart component with better date handling and colors
const AIGeneratedChart = ({ chartData }: { chartData: ChartData }) => {
  // Existing validation code...

  if (!chartData || !chartData.data) {
    console.error("Chart data is invalid");
    return (
      <div className="my-6 p-4 bg-gray-900/50 border border-gray-600 rounded-lg">
        <div className="h-96 w-full flex items-center justify-center">
          <p className="text-gray-400">Chart data is missing or invalid</p>
        </div>
      </div>
    );
  }

  const validatedData = {
    labels: chartData.data.labels || [],
    datasets: chartData.data.datasets || [],
  };

  if (
    validatedData.labels.length === 0 &&
    validatedData.datasets.length === 0
  ) {
    return (
      <div className="my-6 p-4 bg-gray-900/50 border border-gray-600 rounded-lg">
        <div className="h-96 w-full flex items-center justify-center">
          <p className="text-gray-400">No data available for chart</p>
        </div>
      </div>
    );
  }


  const processedLabels = validatedData.labels.map((label) => {
    if (!label) return "";
    const labelStr = String(label);

    // Try to parse as date
    const dateMatch = labelStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [_, year, month, day] = dateMatch;
      return `${month}/${day}/${year.slice(2)}`;
    }

    return labelStr;
  });

  const safeDatasets = validatedData.datasets.map((dataset, idx) => {

    const colors = [
      { bg: "rgba(54, 162, 235, 0.8)", border: "rgba(54, 162, 235, 1)" }, // Blue
      { bg: "rgba(255, 99, 132, 0.8)", border: "rgba(255, 99, 132, 1)" }, // Red
      { bg: "rgba(75, 192, 192, 0.8)", border: "rgba(75, 192, 192, 1)" }, // Teal
      { bg: "rgba(255, 206, 86, 0.8)", border: "rgba(255, 206, 86, 1)" }, // Yellow
      { bg: "rgba(153, 102, 255, 0.8)", border: "rgba(153, 102, 255, 1)" }, // Purple
      { bg: "rgba(255, 159, 64, 8)", border: "rgba(255, 159, 64, 1)" }, // Orange
      { bg: "rgba(255, 80, 80, 0.8)", border: "rgba(255, 80, 80, 1)" }, // Coral
      { bg: "rgba(100, 255, 100, 0.8)", border: "rgba(100, 255, 100, 1)" }, // Green
    ];

    const color = colors[idx % colors.length];

    return {
      ...dataset,
      data: dataset.data || [],
      backgroundColor:
        dataset.backgroundColor ||
        (chartData.type === "bar" ? color.bg : color.bg.replace("0.8", "0.3")),
      borderColor: dataset.borderColor || color.border,
      borderWidth: dataset.borderWidth || 3,
      pointRadius:
        chartData.type === "scatter" ? 6 : (dataset as any).pointRadius || 4,
      pointHoverRadius:
        chartData.type === "scatter"
          ? 8
          : (dataset as any).pointHoverRadius || 6,
      pointBackgroundColor: color.border,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      tension: 0.4, // Smooth curves
      fill: chartData.type === "area" || dataset.fill,
    } as any;
  });

  const safeChartData = {
    labels: processedLabels,
    datasets: safeDatasets,
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#e5e7eb",
          font: { size: 13, weight: "bold" as const },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: true,
        text: chartData.title || "Chart",
        color: "#ffffff",
        font: { size: 18, weight: "bold" as const },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }


            try {
 
              if (chartData.type === "scatter" || chartData.type === "bubble") {
                const parsed = context.parsed;
                if (parsed && typeof parsed === "object") {
                  const x = parsed.x;
                  const y = parsed.y;
                  if (x !== null && x !== undefined && y !== null && y !== undefined) {
                    label += `(${typeof x === "number" ? x.toLocaleString() : x}, ${typeof y === "number" ? y.toLocaleString() : y})`;
                  } else {
                    label += "No data";
                  }
                }
              } 
              // Handle regular charts with y values
              else if (context.parsed && typeof context.parsed === "object" && "y" in context.parsed) {
                const value = context.parsed.y;
                if (value !== null && value !== undefined) {
                  label += typeof value === "number" ? value.toLocaleString() : String(value);
                } else {
                  label += "0";
                }
              } 

              else if (context.parsed !== null && context.parsed !== undefined) {
                const value = context.parsed;
                label += typeof value === "number" ? value.toLocaleString() : String(value);
              } 
              // Fallback
              else {
                label += "No data";
              }
            } catch (error) {
              console.error("Error formatting tooltip:", error);
              label += "Error";
            }

            return label;
          },
        },
      },
    },
    scales:
      chartData.type === "pie" ||
      chartData.type === "doughnut" ||
      chartData.type === "radar" ||
      chartData.type === "polarArea"
        ? {}
        : {
            x: {
              type:
                chartData.type === "scatter" || chartData.type === "bubble"
                  ? ("linear" as const)
                  : ("category" as const),
              ticks: {
                color: "#e5e7eb",
                font: { size: 11 },
                maxRotation: 45,
                minRotation: 0,
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
                drawBorder: true,
                drawOnChartArea: true,
              },
              title: {
                display: true,
                text:
                  chartData.type === "scatter" || chartData.type === "bubble"
                    ? "X Values"
                    : "Categories",
                color: "#e5e7eb",
                font: { size: 13, weight: "bold" as const },
              },
            },
            y: {
              ticks: {
                color: "#e5e7eb",
                font: { size: 11 },
                callback: function (value: any) {

                  if (value === null || value === undefined) return "0";
                  return typeof value === "number" ? value.toLocaleString() : String(value);
                },
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
                drawBorder: true,
              },
              title: {
                display: true,
                text: "Values",
                color: "#e5e7eb",
                font: { size: 13, weight: "bold" as const },
              },
            },
          },
  };

  // ✅ Enhanced chart rendering with support for all chart types
  const renderChart = () => {
    try {
      console.log("📊 Rendering chart:", {
        type: chartData.type,
        labels: processedLabels.slice(0, 5),
        datasetsCount: safeDatasets.length,
        firstDatasetLength: safeDatasets[0]?.data?.length,
      });

      switch (chartData.type) {
        case "line":
        case "area":
          return <Line data={safeChartData} options={chartOptions} />;
        case "bar":
        case "histogram":
          return <Bar data={safeChartData} options={chartOptions} />;
        case "pie":
          return <Pie data={safeChartData} options={chartOptions} />;
        case "doughnut":
          return <Doughnut data={safeChartData} options={chartOptions} />;
        case "scatter":
        case "bubble":
          return <Scatter data={safeChartData} options={chartOptions} />;
        default:
          console.warn(
            `Unknown chart type: ${chartData.type}, falling back to bar chart`
          );
          return <Bar data={safeChartData} options={chartOptions} />;
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
      return (
        <div className="h-96 w-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-400">Failed to render chart</p>
            <p className="text-xs text-gray-500 mt-1">
              Chart type: {chartData.type} | Error:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="my-6 p-4 bg-gray-900/50 border border-gray-600 rounded-lg">
      <div className="h-96 w-full">{renderChart()}</div>
    </div>
  );
};

function AgentPageContent() {
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTransitionBox, setShowTransitionBox] = useState(false);
  const [transitionInput, setTransitionInput] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewSession, setIsNewSession] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const [chatData, setChatData] = useState<ChatData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    currentSession,
    sessions,
    addMessage,
    updateSessionData,
    generateTitle,
    createSession,
    isLoading: sessionsLoading,
    loadSession,
  } = useChatSessions();

  const { context: vectorContext, isLoading: isContextLoading } =
    useVectorContext(input, sessionId);

  const hasData = !!chatData;
  const rawData = chatData?.data || [];
  const currentFile = chatData
    ? {
        name: chatData.metadata.filename,
        rowCount: chatData.metadata.rowCount,
      }
    : null;
  const isStockData = false;
  const availableYears: string[] = [];
  const selectedYear = "all";
  const fileLoading = false;


  const { data: session } = useSession();


  const getUserData = () => {
    if (!session?.user) {
      return { name: 'Guest', email: 'Not signed in', image: null };
    }

    return {
      name: session.user.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || 'No email',
      image: session.user.image || null,
    };
  };

  const userData = getUserData();


  useEffect(() => {
    const initializeSession = async () => {
      const sessionParam = searchParams.get("session");

      if (sessionParam) {
        // ✅ Load existing session
        console.log("📌 Loading existing session:", sessionParam);
        setSessionId(sessionParam);
        setIsNewSession(false);
        setIsFirstMessage(false);

        // ✅ CRITICAL: Load the session object first
        try {
          console.log("🔄 Loading session object...");
          await loadSession(sessionParam); // This will set currentSession
          console.log("✅ Session object loaded");
        } catch (error) {
          console.error("❌ Failed to load session object:", error);
        }

        // ✅ Load existing messages from the session
        try {
          console.log("📥 Fetching messages for session:", sessionParam);
          const response = await fetch(
            `/api/chat-sessions/${sessionParam}/messages`
          );

          if (response.ok) {
            const data = await response.json();
            console.log("📦 Received messages:", data.messages?.length || 0);

            if (data.messages && data.messages.length > 0) {
              // Convert database messages to UI format
              const formattedMessages = data.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                analysis_results: msg.metadata?.analysis_results,
                vector_context_used: msg.vectorContextUsed,
                context_summary: msg.metadata?.context_summary,
                dataContext: msg.metadata?.dataContext,
              }));

              console.log("✅ Formatted messages:", formattedMessages.length);
              setMessages(formattedMessages);
              setShowWelcome(false);
            } else {
              console.log("ℹ️ No messages found in session");
              setMessages([]);
              setShowWelcome(true);
            }
          } else {
            console.error("❌ Failed to load messages:", response.status);
          }
        } catch (error) {
          console.error("❌ Error loading messages:", error);
        }
      } else {
        // ✅ Create new session
        console.log("🆕 Creating new session...");
        try {
          const newSession = await createSession();
          if (newSession) {
            console.log("✅ Created new session:", newSession.id);
            setSessionId(newSession.id);
            setIsNewSession(true);
            setIsFirstMessage(true);


            const url = new URL(window.location.href);
            url.searchParams.set("session", newSession.id);
            window.history.pushState({}, "", url.toString());
          }
        } catch (error) {
          console.error("❌ Error creating session:", error);
          const tempSessionId = `session_${Date.now()}`;
          setSessionId(tempSessionId);
          setIsNewSession(true);
          setIsFirstMessage(true);
        }
      }
    };

    if (isMounted && !sessionsLoading) {
      initializeSession();
    }
  }, [searchParams, isMounted, sessionsLoading, createSession, loadSession]);

  // ✅ Clear data and messages when session changes
  useEffect(() => {
    console.log("🔄 Session changed, clearing chat data");
    setChatData(null);
    setMessages([]);
    setShowWelcome(true);
    setIsNewSession(false);
    setIsFirstMessage(false);
  }, [sessionId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isMounted]);

  useEffect(() => {
    const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
      if (!textarea) return;
      
      textarea.style.height = 'auto';
      const isWelcomeTextarea = textarea === welcomeTextareaRef.current;
      const maxHeight = isWelcomeTextarea ? 200 : 160;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Adjust bottom padding based on content height
      if (isWelcomeTextarea) {
        if (newHeight < 120) {
          textarea.style.paddingBottom = '80px';
        } else {
          textarea.style.paddingBottom = '85px';
        }
      } else {
        if (newHeight < 100) {
          textarea.style.paddingBottom = '64px';
        } else {
          textarea.style.paddingBottom = '68px';
        }
      }
    };
  
    // Adjust height when input changes
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
    if (welcomeTextareaRef.current) {
      adjustTextareaHeight(welcomeTextareaRef.current);
    }
  }, [input]);

  const renderMarkdown = (content: string) => {
    const { content: textContent, charts } = detectAndRenderCharts(content);

    // Convert markdown to HTML-like JSX elements
    const lines = textContent.split("\n");
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = "";
    let chartIndex = 0;
    let elementKey = 0;

    const getNextKey = () => `element-${elementKey++}`;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul
            key={getNextKey()}
            className="list-disc list-inside space-y-1 my-3 ml-4"
          >
            {currentList.map((item, index) => (
              <li key={index} className="text-gray-200">
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre
            key={getNextKey()}
            className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 my-3 overflow-x-auto"
          >
            <code className="text-sm text-gray-300 font-mono">
              {codeBlockContent.join("\n")}
            </code>
          </pre>
        );
        codeBlockContent = [];
      }
    };

    lines.forEach((line, index) => {
      // Handle chart placeholders
      if (line.includes("[CHART_PLACEHOLDER]")) {
        flushList();
        // ✅ FIX: Add bounds checking and validation
        if (chartIndex < charts.length && charts[chartIndex]) {
          try {
            elements.push(
              <AIGeneratedChart
                key={`chart-${chartIndex}-${getNextKey()}`}
                chartData={charts[chartIndex]}
              />
            );
            chartIndex++;
          } catch (error) {
            console.error(
              "Error rendering chart at index",
              chartIndex,
              ":",
              error
            );
            // Skip this chart and continue
            chartIndex++;
          }
        } else {
          console.warn(
            "Chart placeholder found but no chart data available at index:",
            chartIndex
          );
          chartIndex++;
        }
        return;
      }

      // Handle code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith("#")) {
        flushList();
        const headerText = line.replace(/^#+\s*/, "");
        const level = line.match(/^#+/)?.[0].length || 2;

        if (level === 1) {
          elements.push(
            <h1
              key={getNextKey()}
              className="text-2xl font-bold text-white mt-6 mb-3"
            >
              {headerText}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2
              key={getNextKey()}
              className="text-xl font-bold text-white mt-5 mb-2"
            >
              {headerText}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3
              key={getNextKey()}
              className="text-lg font-semibold text-white mt-4 mb-2"
            >
              {headerText}
            </h3>
          );
        } else {
          elements.push(
            <h4
              key={getNextKey()}
              className="text-base font-semibold text-white mt-3 mb-2"
            >
              {headerText}
            </h4>
          );
        }
        return;
      }

      // Handle bullet points
      if (line.match(/^[•\-\*]\s/)) {
        const listItem = line.replace(/^[•\-\*]\s*/, "");
        currentList.push(listItem);
        return;
      }

      // Handle numbered lists
      if (line.match(/^\d+\.\s/)) {
        flushList();
        const listItem = line.replace(/^\d+\.\s*/, "");
        elements.push(
          <ol key={getNextKey()} className="list-decimal list-inside my-2 ml-4">
            <li className="text-gray-200">{formatInlineMarkdown(listItem)}</li>
          </ol>
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === "") {
        flushList();
        elements.push(<br key={getNextKey()} />);
        return;
      }

      // Handle horizontal rules
      if (line.trim() === "---") {
        flushList();
        elements.push(
          <hr key={getNextKey()} className="border-gray-600 my-4" />
        );
        return;
      }

      // Handle regular paragraphs
      flushList();
      if (line.trim()) {
        elements.push(
          <p key={getNextKey()} className="text-gray-200 leading-relaxed my-2">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    });

    // Flush any remaining content
    flushList();
    flushCodeBlock();

    // ✅ FIX: Add remaining charts with proper error handling
    while (chartIndex < charts.length) {
      if (charts[chartIndex]) {
        try {
          elements.push(
            <AIGeneratedChart
              key={`chart-remaining-${chartIndex}-${getNextKey()}`}
              chartData={charts[chartIndex]}
            />
          );
        } catch (error) {
          console.error(
            "Error rendering remaining chart at index",
            chartIndex,
            ":",
            error
          );
        }
      }
      chartIndex++;
    }

    return <div className="space-y-1">{elements}</div>;
  };

  const formatInlineMarkdown = (text: string): React.ReactNode => {
    // Handle bold text
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Handle italic text
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Handle inline code
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-700/50 px-1 py-0.5 rounded text-xs font-mono text-blue-300">$1</code>'
    );

    // Handle links (basic)
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Split by HTML tags and render accordingly
    const parts = formatted.split(/(<[^>]+>)/);
    const elements: React.ReactNode[] = [];

    let i = 0;
    while (i < parts.length) {
      const part = parts[i];

      if (part.startsWith("<strong>")) {
        const content = part.replace(/<\/?strong>/g, "");
        elements.push(
          <strong key={i} className="font-semibold text-white">
            {content}
          </strong>
        );
      } else if (part.startsWith("<em>")) {
        const content = part.replace(/<\/?em>/g, "");
        elements.push(
          <em key={i} className="italic text-gray-300">
            {content}
          </em>
        );
      } else if (part.startsWith("<code")) {
        const content = part.replace(/<code[^>]*>|<\/code>/g, "");
        elements.push(
          <code
            key={i}
            className="bg-gray-700/50 px-1 py-0.5 rounded text-xs font-mono text-blue-300"
          >
            {content}
          </code>
        );
      } else if (part.startsWith("<a")) {
        const hrefMatch = part.match(/href="([^"]+)"/);
        const textMatch = part.match(/>([^<]+)</);
        if (hrefMatch && textMatch) {
          elements.push(
            <a
              key={i}
              href={hrefMatch[1]}
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {textMatch[1]}
            </a>
          );
        }
      } else if (!part.match(/^<[^>]+>$/)) {
        // Regular text
        elements.push(part);
      }

      i++;
    }

    return elements.length > 1 ? <>{elements}</> : elements[0] || text;
  };

  const handleUploadComplete = async (data: any[], metadata: any) => {
    console.log("📁 Data uploaded to chat session:", {
      filename: metadata.filename,
      rows: data.length,
      sessionId,
    });

    // ✅ Store data locally in this chat session only (NOT in localStorage)
    setChatData({
      data,
      metadata,
    });

    toast({
      title: "🎯 Data Loaded!",
      description: `${data.length} rows ready for analysis in this chat`,
    });


    if (currentSession && data.length > 0) {
      try {
        await updateSessionData(
          currentSession.id,
          metadata.filename,
          data.length,
          Object.keys(data[0] || {})
        );
      } catch (error) {
        console.error("Error updating session metadata:", error);
      }
    }

    // ✅ Show a simple confirmation message, don't analyze yet
    const isPostgres = metadata.dataType === 'PostgreSQL Database' || metadata.connectionString;
    
    const confirmationMessage: Message = {
      role: "assistant",
      content: isPostgres ? `🔗 **PostgreSQL Database Connected!**

I've successfully connected to your PostgreSQL database.

**Database Details:**
• Database: ${metadata.database || 'Connected'}
• Tables: ${metadata.tableCount || 0} tables available
• Connection: Established ✅

**Ready for Analysis!** 🚀
You can now ask me to:
• "Show me all tables"
• "Analyze data from the [table_name] table"
• "Query the database for [your question]"
• "Create a chart from [table_name]"

*I can query your database, analyze the data, and create visualizations!* 💡` : `📊 **Data Loaded Successfully!**

I've loaded "${
        metadata.filename
      }" with **${data.length.toLocaleString()} rows** into this chat session.

**File Details:**
• Filename: ${metadata.filename}
• Rows: ${data.length.toLocaleString()}
• Columns: ${Object.keys(data[0] || {}).length} (${Object.keys(data[0] || {})
        .slice(0, 5)
        .join(", ")}${Object.keys(data[0] || {}).length > 5 ? "..." : ""})
• Size: ${(metadata.fileSize / 1024).toFixed(2)} KB

**Ready for Analysis!** 🚀
Ask me anything about your data and I'll analyze  "Analyze the key trends in this data"
• "What are the statistical insights?"
• "Show me correlations between columns"

*Note: I'll only process your data when you send a message - saving your API credits!* 💡`,
      timestamp: new Date().toISOString(),
      dataContext: isPostgres ? {
        fileName: metadata.database || 'PostgreSQL Database',
        rowCount: 0,
        dataType: "PostgreSQL Database",
        columns: [],
      } : {
        fileName: metadata.filename,
        rowCount: data.length,
        dataType: "General Data",
        columns: Object.keys(data[0] || {}),
      },
    };

    setMessages([confirmationMessage]);
    setShowWelcome(false);
  };

  const getDataContext = () => {
    if (!hasData || !rawData.length) return null;

    const columns = Object.keys(rawData[0] || {});
    const sampleData = rawData.slice(0, 5);

    return {
      fileName: currentFile?.name || "Unknown File",
      rowCount: currentFile?.rowCount || rawData.length,
      dataType: isStockData ? "Stock/Financial Data" : "General Data",
      columns,
      sampleData,
      totalColumns: columns.length,
      availableYears: availableYears.length > 0 ? availableYears : null,
      selectedYear: selectedYear !== "all" ? selectedYear : null,
      hasChartData: false,
      previousAnalysis: null,
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (isFromWelcomeScreen = false) => {
    if (!input.trim() || isLoading) return;
  
    const currentInput = input;
    setTransitionInput(currentInput);
  
    // Handle welcome screen transition
    if (isFromWelcomeScreen && showWelcome) {
      setIsTransitioning(true);
      setShowTransitionBox(true);
      
      setTimeout(() => {
        setShowWelcome(false);
      }, 200);
      
      setTimeout(() => {
        setIsTransitioning(false);
        setShowTransitionBox(false);
        setTransitionInput('');
      }, 1200);
    }
  
    const dataContext = getDataContext();
    const userMessage: Message = {
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString(),
      dataContext: dataContext ? {
        fileName: dataContext.fileName,
        rowCount: dataContext.rowCount,
        dataType: dataContext.dataType,
        columns: dataContext.columns
      } : undefined
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      console.log('🚀 Sending message to AI:', {
        hasData,
        sessionId,
        currentSessionId: currentSession?.id,
        isFirstMessage,
        messageText: currentInput.substring(0, 50)
      });
  
  
      if (!sessionId || !currentSession) {
        throw new Error('No active session - cannot save messages');
      }
  
      // Check for PostgreSQL connection in metadata
      const hasPostgres = chatData?.metadata?.connectionString || chatData?.metadata?.dataType === 'PostgreSQL Database';
      const postgresConnectionString = chatData?.metadata?.connectionString;

      const requestPayload = {
        message: formatUserPrompt(currentInput, hasData, dataContext),
        dataset: hasData && rawData.length > 0 ? {
          data: rawData.slice(0, 500),
          metadata: {
            filename: currentFile?.name || 'uploaded_data.csv',
            total_rows: rawData.length,
            columns: dataContext?.columns || [],
            data_type: isStockData ? 'stock' : 'general',
            sample_size: Math.min(500, rawData.length),
            is_stock_data: isStockData,
            available_years: availableYears.length > 0 ? availableYears : [],
            selected_year: selectedYear !== 'all' ? selectedYear : 'all'
          }
        } : hasPostgres ? {
          data: [], // Empty data array for PostgreSQL
          metadata: {
            connectionString: postgresConnectionString,
            dataType: 'PostgreSQL Database',
            database: chatData?.metadata?.database,
            tableCount: chatData?.metadata?.tableCount,
            schema: chatData?.metadata?.schema,
            sessionId: sessionId
          }
        } : null,
        context: {
          has_uploaded_data: hasData,
          has_postgres_connection: hasPostgres,
          user_request_type: detectRequestType(currentInput),
          previous_analysis: null,
          handle_parsing_errors: true,
          user_id: session?.user?.id || 'anonymous', 
          session_id: sessionId,
          original_query: currentInput
        }
      };
  
      const response = await fetch(`${FASTAPI_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload),
      });
  
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
  
      const result = await response.json();
      console.log('✅ FastAPI response received');
      
      let responseContent = extractCleanResponse(result);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: result.timestamp || new Date().toISOString(),
        analysis_results: result.analysis_results,
        vector_context_used: result.vector_context_used || false,
        context_summary: result.context_summary || undefined,
        dataContext: dataContext ? {
          fileName: dataContext.fileName,
          rowCount: dataContext.rowCount,
          dataType: dataContext.dataType,
          columns: dataContext.columns
        } : undefined
      };
  
      setMessages(prev => [...prev, assistantMessage]);
  
  
      console.log('💾 Starting message save process...');
      console.log('   Session ID:', sessionId);
      console.log('   Current Session:', currentSession?.id);
      console.log('   Is First Message:', isFirstMessage);
  
      try {
        // ✅ Save user message FIRST
        console.log('💾 Saving user message...');
        const userMessageResult = await addMessage(
          sessionId,
          'user',
          currentInput,
          false,
          null,
          { dataContext }
        );
        console.log('✅ User message saved:', userMessageResult);
  

        console.log('💾 Saving assistant message...');
        const assistantMessageResult = await addMessage(
          sessionId,
          'assistant',
          responseContent,
          result.vector_context_used || false,
          result.analysis_type || null,
          { 
            context_summary: result.context_summary,
            analysis_results: result.analysis_results 
          }
        );
        console.log('✅ Assistant message saved:', assistantMessageResult);

        if (isFirstMessage) {
          console.log('🏷️ This is the first message - generating title...');
          try {
            await generateTitle(
              sessionId,
              currentInput,
              responseContent,
              hasData,
              currentFile?.name || null
            );
            console.log('✅ Title generation completed');
            setIsFirstMessage(false);
          } catch (titleError) {
            console.error('❌ Title generation failed (non-fatal):', titleError);
            // Don't throw - title generation is optional
          }
        } else {
          console.log('ℹ️ Not first message - skipping title generation');
        }
  
        console.log('✅ ALL MESSAGES SAVED TO DATABASE');
  
        toast({
          title: "✅ Messages Saved",
          description: "Your conversation has been saved",
        });
  
      } catch (saveError) {
        console.error('❌ CRITICAL: Failed to save messages:', saveError);
        toast({
          title: "⚠️ Save Failed",
          description: "Messages shown but not saved to history",
          variant: "destructive"
        });
        // Don't throw - let user continue chatting
      }
  
      toast({
        title: "✨ Analysis Complete!",
        description: hasData ? 
          `AI analyzed ${Math.min(500, rawData.length)} rows from ${currentFile?.name}` : 
          "AI agent responded to your query",
      });
  
    } catch (error) {
      console.error('❌ AI Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: generateErrorMessage(error, hasData, dataContext, currentInput),
        timestamp: new Date().toISOString(),
        dataContext: dataContext ? {
          fileName: dataContext.fileName,
          rowCount: dataContext.rowCount,
          dataType: dataContext.dataType,
          columns: dataContext.columns
        } : undefined
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Analysis Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectRequestType = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (
      lowerInput.includes("market") ||
      lowerInput.includes("stock") ||
      lowerInput.includes("invest")
    ) {
      return "market_analysis";
    } else if (
      lowerInput.includes("statistical") ||
      lowerInput.includes("correlat") ||
      lowerInput.includes("pattern")
    ) {
      return "statistical_analysis";
    } else if (
      lowerInput.includes("predict") ||
      lowerInput.includes("forecast")
    ) {
      return "prediction";
    } else if (
      lowerInput.includes("visualiz") ||
      lowerInput.includes("chart") ||
      lowerInput.includes("plot")
    ) {
      return "visualization";
    }
    return "general_analysis";
  };

  const extractCleanResponse = (result: any): string => {
    let responseContent =
      result.response || result.message || result.output || result.answer || "";

    if (result.status === "fallback" && result.error) {
      console.info("Using fallback response due to agent error");
    }

    if (result.status === "error") {
      return (
        result.response ||
        "I encountered an error processing your request. Please try again."
      );
    }

    if (
      responseContent.includes("Thought:") ||
      responseContent.includes("Action:")
    ) {
      const patterns = [
        /AI:\s*(.*?)(?:\n```|$)/,
        /Final Answer:\s*(.*?)(?:\n```|$)/,
        /Answer:\s*(.*?)(?:\n```|$)/,
      ];

      for (const pattern of patterns) {
        const match = responseContent.match(pattern);
        if (match && match[1]) {
          responseContent = match[1].trim();
          break;
        }
      }
    }

    responseContent = responseContent
      .replace(/^Thought:.*$/gm, "")
      .replace(/^Action:.*$/gm, "")
      .replace(/^Action Input:.*$/gm, "")
      .replace(/^Observation:.*$/gm, "")
      .replace(/```$/, "")
      .trim();

    if (!responseContent) {
      responseContent =
        "I received your message, but there was an issue with the response format. Could you please rephrase your question?";
    }

    return responseContent;
  };

  const generateErrorMessage = (
    error: any,
    hasData: boolean,
    dataContext: any,
    userInput: string
  ): string => {
    const errorStr = error instanceof Error ? error.message : String(error);

    if (
      errorStr.includes("parsing error") ||
      errorStr.includes("Could not parse LLM output")
    ) {
      return `I understand your question "${userInput.slice(0, 100)}${
        userInput.length > 100 ? "..." : ""
      }", but there was a formatting issue with my response.

**What you asked about:** ${userInput}

**Issue:** The AI agent had trouble formatting the response properly, but I can still help you.

${
  hasData
    ? `**Your current data:** I can see you have "${
        dataContext?.fileName
      }" loaded with ${dataContext?.rowCount?.toLocaleString()} rows. I can analyze this for investment insights.`
    : "**No data loaded:** Upload financial data to get specific investment analysis."
}

Would you like to rephrase your question or upload some data for me to analyze?`;
    }

    return hasData
      ? `I apologize, but I encountered an error while analyzing "${dataContext?.fileName}".

**Error Details:**
${errorStr}

Please try a simpler question about your dataset.`
      : `I can help you with data analysis, but I need data to work with first.

**Your Question:** "${userInput}"

**To get started:**
1. Click the upload button (📎) next to the message box
2. Upload a CSV file with your data
3. Ask me questions about your data

Would you like to upload some data to analyze?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(showWelcome);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    setChatData(null);
    toast({
      title: "🔄 Chat Cleared",
      description: "Conversation history and data have been reset",
    });
  };

  const copyMessage = async (content: string, messageIndex: number) => {
    try {
      // Strip markdown for clipboard
      const plainText = content
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/#{1,6}\s*([^\n]+)/g, "$1")
        .replace(/[•\-\*]\s*/g, "• ");

      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(messageIndex.toString());
      setTimeout(() => setCopiedMessageId(null), 2000);

      toast({
        title: "📋 Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const useExamplePrompt = (prompt: string) => {
    setInput(prompt);
    if (showWelcome) {
      welcomeTextareaRef.current?.focus();
    } else {
      textareaRef.current?.focus();
    }
  };

  const getVisualizationPrompts = () => {
    if (!hasData) return [];

    const dataContext = getDataContext();
    const numericColumns =
      dataContext?.columns?.filter((col) =>
        rawData.some((row) => typeof row[col] === "number")
      ) || [];

    return [
      {
        icon: <Activity className="h-5 w-5" />,
        title: "Interactive Dashboard",
        description: "Multiple charts showing different data perspectives",
        prompt: `🎯 Create an interactive dashboard with multiple visualizations for ${dataContext?.fileName}. Include trend analysis, distribution charts, and comparative analysis.`,
      },
      {
        icon: <LineChart className="h-5 w-5" />,
        title: "Advanced Trend Analysis",
        description: "Professional time-series visualizations",
        prompt: `📈 Create professional line charts with interactive features showing trends in ${numericColumns
          .slice(0, 2)
          .join(" and ")} over time.`,
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Comparative Dashboard",
        description: "Interactive comparison charts",
        prompt: `📊 Create interactive bar charts and comparison visualizations for analyzing different categories and metrics in my data.`,
      },
      {
        icon: <PieChart className="h-5 w-5" />,
        title: "Distribution Analysis",
        description: "Interactive pie and doughnut charts",
        prompt: `🥧 Create interactive distribution charts (pie/doughnut) showing the composition and proportions in my dataset.`,
      },
    ];
  };

  const getContextualPrompts = () => {
    if (!hasData) {
      return [
        {
          icon: <Database className="h-5 w-5" />,
          title: "Upload Data",
          description: "Click the upload button to add CSV data",
          prompt: "How do I upload data to analyze?",
        },
        {
          icon: <FileText className="h-5 w-5" />,
          title: "Supported Formats",
          description: "What file formats can I upload?",
          prompt: "What file formats do you support for data analysis?",
        },
        {
          icon: <Brain className="h-5 w-5" />,
          title: "Analysis Types",
          description: "What kind of analysis can you perform?",
          prompt: "What types of data analysis can you help me with?",
        },
      ];
    }

    const dataContext = getDataContext();
    const basePrompts = [...EXAMPLE_PROMPTS];
    const vizPrompts = getVisualizationPrompts();

    // Combine analysis and visualization prompts
    return [
      ...basePrompts.slice(0, 3),
      ...vizPrompts,
      ...basePrompts.slice(3),
    ].slice(0, 6);
  };

  const contextualPrompts = getContextualPrompts();

  const DataStatusBadge = () => {
    if (!hasData) return null;

    const dataContext = getDataContext();
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-green-500/20 text-green-400 border-green-500/30"
        >
          <Database className="h-3 w-3 mr-1" />
          {dataContext?.rowCount?.toLocaleString()} rows
        </Badge>
        <Badge
          variant="secondary"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
        >
          <FileText className="h-3 w-3 mr-1" />
          {dataContext?.totalColumns} columns
        </Badge>
        <Badge
          variant="secondary"
          className="bg-purple-500/20 text-purple-400 border-purple-500/30"
        >
          <PieChart className="h-3 w-3 mr-1" />
          {dataContext?.dataType}
        </Badge>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="h-screen bg-black/80 text-white flex flex-col overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading AI Agent...</p>
          </div>
        </div>
      </div>
    );
  }

  const TransitionBox = () => {
    if (!showTransitionBox) return null;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          ref={transitionRef}
          className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
            isTransitioning
              ? "top-[calc(100%-8rem)] scale-90"
              : "top-1/2 -translate-y-1/2 scale-100"
          }`}
          style={{ width: "min(768px, 80vw)" }}
        >
          <div className="relative group">
            <Textarea
              value={transitionInput}
              readOnly
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[70px] text-lg rounded-3xl pl-8 pr-24 py-6 transition-all duration-300"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <Button
                size="sm"
                className="bg-purple-700 text-white rounded-xl h-10 w-10 p-0 transition-all duration-300 shadow-lg"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if ((messages.length === 0 && !fileLoading) || showWelcome) {
    return (
      <>
        <div className="h-screen bg-[#0f1112] text-white flex flex-col overflow-hidden relative">
       
          {isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="fixed top-8 left-20 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-2 transition-all duration-300 group shadow-lg hover:shadow-xl"
              title="Open Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
          )}

          <div className={`backdrop-blur-sm sticky top-0 z-10 transition-all duration-800 ${
            isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div
              className={`mx-auto p-6 transition-all duration-300 ${
                isSidebarCollapsed ? "max-w-full" : "max-w-7xl"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"></div>
                <div className="flex items-center gap-3">
                  <DataStatusBadge />
                  {!hasData && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No Data
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto relative z-10">
            <div
              className={`w-full text-center space-y-12 transition-all duration-800 ${
                isSidebarCollapsed ? "max-w-5xl" : "max-w-4xl"
              } ${
                isTransitioning
                  ? "opacity-0 translate-y-8"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <div className="space-y-6">
                <div className="relative">
                  <h1 className="text-5xl font-bold text-white leading-tight">
                    {hasData
                      ? "Let's analyze your data!"
                      : "Ready for smart data analysis?"}
                  </h1>
                </div>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {hasData
                    ? `I've loaded "${
                        currentFile?.name
                      }" with ${currentFile?.rowCount?.toLocaleString()} rows. Ask me any question and I'll analyze it for you!`
                    : "Upload your data using the attach button below, then ask me any questions about it"}
                </p>
              </div>

              {vectorContext && vectorContext.has_context && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-blue-400">
                      AI Context Ready
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    I found {vectorContext.similar_analyses.length} similar
                    analyses for your query
                  </p>
                </div>
              )}

              <div className="relative max-w-3xl mx-auto">
                <div
                  className={`relative group transition-all duration-300 ${
                    showTransitionBox ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <Textarea
                    ref={welcomeTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      hasData
                        ? `Ask anything about ${currentFile?.name}...`
                        : "Upload data using the 📎 button, then ask me questions..."
                    }
                    className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[70px] max-h-[200px] text-lg rounded-3xl pl-8 pr-32 py-6 pb-20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:bg-white/10 overflow-y-auto"
                    disabled={isLoading || fileLoading}
                    style={{
                      height: 'auto',
                      minHeight: '70px',
                      maxHeight: '200px',
                      paddingBottom: '80px', // Extra space for buttons
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const newHeight = Math.min(target.scrollHeight, 200);
                      target.style.height = `${newHeight}px`;
                      
                      // Ensure minimum bottom padding even when content is short
                      if (newHeight < 120) {
                        target.style.paddingBottom = '80px';
                      } else {
                        target.style.paddingBottom = '85px';
                      }
                    }}
                  />

                  {isContextLoading && (
                    <div className="absolute top-3 right-28 flex items-center gap-1 text-xs text-blue-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Finding context...</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>

                    <Button
                      onClick={() => handleSend(true)}
                      disabled={!input.trim() || isLoading || fileLoading}
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-10 w-10 p-0 transition-all duration-300 shadow-lg"
                    >
                      {isLoading || fileLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUp />
                      )}
                    </Button>
                  </div>

                  {/* Add Sources Button - Left Side */}
                  <div className="absolute bottom-4 left-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      title="Upload Data"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Sources</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 transition-all duration-800 delay-200 ${
                  isTransitioning
                    ? "opacity-0 translate-y-8"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {contextualPrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (example.title === "Upload Data") {
                        setIsUploadModalOpen(true);
                      } else {
                        useExamplePrompt(example.prompt);
                      }
                    }}
                    disabled={
                      !hasData &&
                      example.title !== "Upload Data" &&
                      example.title !== "Supported Formats" &&
                      example.title !== "Analysis Types"
                    }
                    className={`group relative text-left p-6 rounded-2xl transition-all duration-300 border ${
                      !hasData &&
                      example.title !== "Upload Data" &&
                      example.title !== "Supported Formats" &&
                      example.title !== "Analysis Types"
                        ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        : "bg-white/5 backdrop-blur-sm hover:bg-white/10 border-white/10 hover:border-white/20 hover:scale-105 cursor-pointer"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          !hasData &&
                          example.title !== "Upload Data" &&
                          example.title !== "Supported Formats" &&
                          example.title !== "Analysis Types"
                            ? "bg-gray-500/20 text-gray-500"
                            : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:from-blue-500/30 group-hover:to-purple-500/30"
                        }`}
                      >
                        {example.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 transition-colors ${
                            !hasData &&
                            example.title !== "Upload Data" &&
                            example.title !== "Supported Formats" &&
                            example.title !== "Analysis Types"
                              ? "text-gray-500"
                              : "text-white group-hover:text-blue-300"
                          }`}
                        >
                          {example.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors ${
                            !hasData &&
                            example.title !== "Upload Data" &&
                            example.title !== "Supported Formats" &&
                            example.title !== "Analysis Types"
                              ? "text-gray-600"
                              : "text-gray-400 group-hover:text-gray-300"
                          }`}
                        >
                          {example.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <TransitionBox />

        <ChatUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={handleUploadComplete}
          sessionId={sessionId}
        />
      </>
    );
  }

  return (
    <div className="h-screen bg-[#0f1112] text-white flex flex-col overflow-hidden relative">

      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-8 left-20 z-50  hover:bg-white/20 backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
          title="Open Sidebar"
        >
          <PanelRightClose className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
        </button>
      )}

      <div className="backdrop-blur-sm max-h-20 sticky top-0 z-10 hidden md:block">
        <div
          className={`mx-auto py-2 px-4 transition-all duration-300 ${
            isSidebarCollapsed ? "max-w-full" : "max-w-7xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DataStatusBadge />
            </div>
            <div className="flex items-center gap-2">
              {hasData && (
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {vectorContext && vectorContext.has_context && (
        <div className="mx-auto px-4 py-2 max-w-4xl">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-blue-400">
                AI Context Suggestions
              </span>
            </div>

            {vectorContext.similar_analyses.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs text-gray-400 mb-1">
                  Similar Past Analyses:
                </h4>
                <div className="space-y-1">
                  {vectorContext.similar_analyses
                    .slice(0, 2)
                    .map((analysis, index) => (
                      <div
                        key={index}
                        className="text-xs bg-white/5 rounded p-2"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">
                            {analysis.analysis_type}
                          </span>
                          <span className="text-gray-500">
                            ({Math.round(analysis.score * 100)}% similar)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div
          className={`mx-auto space-y-8 transition-all duration-300 ${
            isSidebarCollapsed ? "max-w-4xl" : "max-w-3xl"
          }`}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="w-10 h-10 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Image
                      src="/anilyst_logo.svg"
                      alt="AI Agent"
                      width={24}
                      height={34}
                      className="w-6 h-7 object-cover"
                      unoptimized
                    />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[85%] ${
                  message.role === "user" ? "order-first" : ""
                }`}
              >
                <div
                  className={`relative group rounded-2xl ${
                    message.role === "user"
                      ? "bg-white/5 backdrop-blur-sm text-gray-100 p-4"
                      : "bg-white/5 backdrop-blur-sm text-gray-100 p-6"
                  }`}
                >
                  {/* Copy button */}
                  <button
                    onClick={() => copyMessage(message.content, index)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-white/10 rounded"
                    title="Copy message"
                  >
                    {copiedMessageId === index.toString() ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>


                  <div className="prose prose-sm max-w-none text-current">
                    {message.role === "user" ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-gray-200">
                        {message.content}
                      </div>
                    ) : (
                      renderMarkdown(message.content)
                    )}
                  </div>

                  {message.vector_context_used && message.context_summary && (
                    <div className="mt-4 text-xs text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-3 w-3" />
                        <span className="font-medium">
                          Enhanced with AI Context
                        </span>
                      </div>
                      <p className="text-blue-200">
                        Analyzed{" "}
                        {message.context_summary.similar_analyses_count} similar
                        past analyses for personalized insights
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <Avatar className="w-10 h-10 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-white/10 text-white p-0 overflow-hidden">
                    {userData.image ? (
                      <Image
                        src={userData.image}
                        alt={userData.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-10 h-10 mt-1">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  <span className="text-sm">
                    {hasData
                      ? `Analyzing ${currentFile?.name}...`
                      : "Processing your request..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="backdrop-blur-sm p-6">
        <div
          className={`mx-auto relative transition-all duration-300 ${
            isSidebarCollapsed ? "max-w-4xl" : "max-w-3xl"
          }`}
        >
          <div className="relative group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                hasData
                  ? `Ask anything about ${currentFile?.name}...`
                  : "Upload data first using the attach button..."
              }
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 resize-none min-h-[60px] max-h-[160px] rounded-2xl pl-6 pr-32 py-4 pb-16 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 overflow-y-auto"
              disabled={isLoading || fileLoading}
              style={{
                height: 'auto',
                minHeight: '60px',
                maxHeight: '160px',
                paddingBottom: '64px', // Extra space for buttons
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                const newHeight = Math.min(target.scrollHeight, 160);
                target.style.height = `${newHeight}px`;
                
                // Ensure minimum bottom padding even when content is short
                if (newHeight < 100) {
                  target.style.paddingBottom = '64px';
                } else {
                  target.style.paddingBottom = '68px';
                }
              }}
            />

            {isContextLoading && (
              <div className="absolute top-3 right-28 flex items-center gap-1 text-xs text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Context...</span>
              </div>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleSend(false)}
                disabled={!input.trim() || isLoading || fileLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-9 w-9 p-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                {isLoading || fileLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Add Sources Button - Left Side */}
            <div className="absolute bottom-3 left-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/10  hover:border-white/20 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                title="Upload Data"
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-sm font-medium">Add Sources</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ChatUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        sessionId={sessionId}
      />
    </div>
  );
}

const EXAMPLE_PROMPTS = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Interactive Dashboard",
    description: "Create a comprehensive dashboard with multiple charts",
    prompt:
      " Create an interactive dashboard with multiple visualizations showing different perspectives of my data",
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: "Trend Analysis",
    description: "Display trends over time with interactive line charts",
    prompt:
      "📈 Create interactive line charts showing trends and patterns over time in my dataset",
  },
  {
    icon: <PieChart className="h-5 w-5" />,
    title: "Distribution Charts",
    description: "Show data distribution with pie and doughnut charts",
    prompt:
      "🥧 Create interactive pie and doughnut charts showing the distribution and composition of my data",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Correlation Analysis",
    description: "Interactive scatter plots showing relationships",
    prompt:
      "🔍 Create interactive scatter plots to analyze correlations and relationships between variables",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Comparative Analysis",
    description: "Bar charts for comparing categories and values",
    prompt:
      "📊 Create interactive bar charts for comparing different categories and their values",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Professional Visualization",
    description: "Tableau/Power BI style interactive charts",
    prompt:
      "✨ Create professional, interactive visualizations like Tableau or Power BI for comprehensive data analysis",
  },
];

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-black/80 text-white flex flex-col overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading AI Agent...</p>
            </div>
          </div>
        </div>
      }
    >
      <AgentPageContent />
    </Suspense>
  );
}

const formatUserPrompt = (
  input: string,
  hasData: boolean,
  dataContext: any
): string => {
  let prompt = input.trim();

  if (hasData && dataContext) {
    prompt += `\n\nCONTEXT: I have uploaded a dataset "${
      dataContext.fileName
    }" with ${
      dataContext.rowCount
    } rows and these columns: ${dataContext.columns.join(
      ", "
    )}. Please analyze this data in your response.`;
  } else {
    prompt += `\n\nCONTEXT: I don't have any data uploaded yet. Please provide general guidance.`;
  }

  prompt += `\n\nINSTRUCTION: Please provide a clear, direct response without agent thinking patterns.`;

  return prompt;
};
