"use client";

import { useState, useEffect, useRef, Suspense, Fragment } from "react";
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
  RotateCcw,
  ExternalLink,
  Code,
  Pencil,
  BookOpen,
  X,
  Share2,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSidebar } from "@/app/dashboard/layout";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Highlight, PrismTheme } from "prism-react-renderer";
import ChatUploadModal from "./chat-upload-modal";

/** Neutral vibrant code theme: mixed colors (blue, green, amber, rose, teal) on a neutral dark background */
const ANILYST_CODE_THEME: PrismTheme = {
  plain: {
    color: "#cbd5e1",
    backgroundColor: "#1e293b",
  },
  styles: [
    { types: ["comment"], style: { color: "#64748b", fontStyle: "italic" } },
    { types: ["prolog", "doctype"], style: { color: "#94a3b8" } },
    { types: ["keyword", "boolean", "changed"], style: { color: "#f472b6" } },
    { types: ["builtin"], style: { color: "#38bdf8" } },
    { types: ["number", "inserted"], style: { color: "#fbbf24" } },
    { types: ["constant"], style: { color: "#2dd4bf" } },
    { types: ["attr-name", "variable", "property"], style: { color: "#7dd3fc" } },
    { types: ["function"], style: { color: "#a78bfa" } },
    { types: ["class-name"], style: { color: "#2dd4bf" } },
    { types: ["deleted", "string", "attr-value", "template-punctuation", "interpolation", "char"], style: { color: "#4ade80" } },
    { types: ["selector"], style: { color: "#fbbf24" } },
    { types: ["tag"], style: { color: "#38bdf8" } },
    { types: ["punctuation", "operator"], style: { color: "#94a3b8" } },
  ],
};
import { useChatSessions } from "@/hooks/useChatSessions";
import { fetchWithCsrf } from "@/lib/api-client";
import { sanitizeHref } from "@/lib/sanitize";

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

/** Extract web sources from markdown content (Sources section and inline links) */
function extractWebSourcesFromContent(content: string): WebSource[] {
  const sources: WebSource[] = [];
  const seen = new Set<string>();
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let inSources = false;
  for (const line of content.split("\n")) {
    const s = line.trim();
    if (line.includes("📎") && /Sources/i.test(line)) inSources = true;
    if (inSources && s.startsWith("- ")) {
      for (const m of s.matchAll(linkRe)) {
        const [, title, url] = m;
        if (url?.startsWith("http") && !seen.has(url)) {
          seen.add(url);
          sources.push({ title: (title || url).trim(), url: url.trim(), snippet: undefined });
        }
      }
    } else if (inSources && s && !s.startsWith("- ")) inSources = false;
  }
  for (const m of content.matchAll(linkRe)) {
    if (sources.length >= 20) break;
    const [, title, url] = m;
    if (url?.startsWith("http") && !seen.has(url)) {
      seen.add(url);
      const lastPara = content.lastIndexOf("\n\n", m.index);
      const paraStart = lastPara < 0 ? 0 : lastPara + 2;
      const nextPara = content.indexOf("\n\n", m.index + m[0].length);
      const paraEnd = nextPara < 0 ? content.length : nextPara;
      const para = content.slice(paraStart, paraEnd);
      let snippet = para.replace(/\[([^\]]+)\]\([^)]+\)/g, "").replace(/\s+/g, " ").trim();
      if (snippet.length > 250) snippet = snippet.slice(0, 247) + "...";
      sources.push({ title: (title || url).trim(), url: url.trim(), snippet: snippet || undefined });
    }
  }
  return sources;
}

/** Format OpenRouter model id (e.g. openai/gpt-4o) for display (e.g. OpenAI: GPT-4o) */
function formatModelLabel(modelId: string): string {
  if (!modelId || modelId === "unknown") return "AI";
  const [provider, name] = modelId.split("/");
  const providerLabel =
    provider === "openai"
      ? "OpenAI"
      : provider === "anthropic"
        ? "Anthropic"
        : provider === "google"
          ? "Google"
          : provider?.charAt(0)?.toUpperCase() + (provider?.slice(1) ?? "");
  const nameLabel = (name ?? modelId)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${providerLabel}: ${nameLabel}`;
}

interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  analysis_results?: any;
  vector_context_used?: boolean;
  /** Web search was used; show sources button and inline citation pills */
  web_search_used?: boolean;
  /** Structured sources from API (or parsed from content) */
  webSources?: WebSource[];
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
  /** When set, show a "Connect Stripe" (or other) card with this URL so the agent can read data via Arcade */
  authorizationUrl?: string;
  authorizationMessage?: string;
  /** Model used for this response (e.g. OpenAI: GPT-4o) – shown in footer */
  model_used?: string;
  /** Approximate token count – shown in footer when available */
  token_count?: number;
  questions?: Array<{
    field: string;
    question: string;
    required?: boolean;
    task?: string;
    action?: string;
  }>;
  needsInfo?: boolean;
}

/** Map common language labels to Prism language ids */
const PRISM_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  yml: "yaml",
  sh: "bash",
  shell: "bash",
  md: "markdown",
  rb: "ruby",
  go: "go",
  rs: "rust",
  kt: "kotlin",
  java: "java",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  sql: "sql",
  html: "markup",
  xml: "markup",
};

/** VS Code–style code block with syntax highlighting and copy button */
function CodeBlock({
  content,
  language,
  blockKey,
  copiedKey,
  onCopy,
}: {
  content: string;
  language: string;
  blockKey: string;
  copiedKey: string | null;
  onCopy: (k: string) => void;
}) {
  const copied = copiedKey === blockKey;
  const prismLang = language
    ? (PRISM_LANG[language.toLowerCase()] || language.toLowerCase())
    : "plaintext";
  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#1e293b] shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-white/5">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Code className="h-3.5 w-3.5" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(content);
            onCopy(blockKey);
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Highlight theme={ANILYST_CODE_THEME} code={content.trimEnd()} language={prismLang}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`p-4 overflow-x-auto text-sm leading-relaxed m-0 font-mono text-[13px] ${className}`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

interface VectorContext {
  similar_analyses: Array<{
    id?: string;
    score?: number;
    similarity_score?: number;
    analysis_type?: string;
    key_insights?: string[];
    session_id?: string;
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

function useVectorContext(
  query: string,
  sessionId: string | null,
  userId: string | null
) {
  const [context, setContext] = useState<VectorContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 8 || !sessionId || !userId || userId === "anonymous") {
      setContext(null);
      return;
    }

    const getContext = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithCsrf("/api/vector/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query.trim(),
            session_id: sessionId,
            user_id: userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Backend returns { context: { has_context, similar_analyses, ... } }
          const ctx = data.context ?? data;
          if (ctx && ctx.has_context) {
            setContext(ctx);
          } else {
            setContext(null);
          }
        } else {
          setContext(null);
        }
      } catch (error) {
        console.error("Error fetching vector context:", error);
        setContext(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(getContext, 800);
    return () => clearTimeout(timer);
  }, [query, sessionId, userId]);

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
      <div className="my-6 p-4 bg-gray-900/50 rounded-lg">
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
      <div className="my-6 p-4 bg-gray-900/50 rounded-lg">
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
    <div className="my-6 p-4 bg-gray-900/50 rounded-lg">
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
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTransitionBox, setShowTransitionBox] = useState(false);
  const [transitionInput, setTransitionInput] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewSession, setIsNewSession] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  /** When set, next send replaces this user message (and following messages) with the new prompt (rewrite flow) */
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  /** Sources sidebar: open state and data for the selected message */
  const [sourcesSidebarOpen, setSourcesSidebarOpen] = useState(false);
  const [sourcesSidebarMessageIndex, setSourcesSidebarMessageIndex] = useState<number | null>(null);
  const [sourcesSidebarData, setSourcesSidebarData] = useState<{
    sources: WebSource[];
    query?: string;
  } | null>(null);

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

  const { data: session } = useSession();

  const { context: vectorContext, isLoading: isContextLoading } =
    useVectorContext(
      input,
      sessionId,
      (session?.user?.id as string) || (session?.user?.email as string) || null
    );

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
                web_search_used: msg.metadata?.web_search_used,
                webSources: msg.metadata?.webSources,
              }));

              console.log("✅ Formatted messages:", formattedMessages.length);
              setMessages(formattedMessages);
              setShowWelcome(false);
              setIsFirstMessage(false); // Has messages - not first prompt
            } else {
              console.log("ℹ️ No messages found in session - new chat, will rename after first prompt");
              setMessages([]);
              setShowWelcome(true);
              setIsFirstMessage(true); // No messages - first prompt will trigger title rename
            }
          } else {
            console.error("❌ Failed to load messages:", response.status);
            setIsFirstMessage(true); // Assume new on error
          }
        } catch (error) {
          console.error("❌ Error loading messages:", error);
          setIsFirstMessage(true); // Assume new on error
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

  // ✅ Clear data and messages when switching to a different session (user clicked another chat)
  const prevSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Only clear when switching from one session to another (not on initial load)
    if (
      prevSessionIdRef.current !== null &&
      sessionId !== null &&
      prevSessionIdRef.current !== sessionId
    ) {
      console.log("🔄 Session switched, clearing chat data");
      setChatData(null);
      setMessages([]);
      setShowWelcome(true);
      setIsNewSession(false);
      setIsFirstMessage(false);
    }
    prevSessionIdRef.current = sessionId;
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

  const renderMarkdown = (content: string, opts?: { citationPills?: boolean }) => {
    const citationPills = opts?.citationPills ?? false;
    const { content: textContent, charts } = detectAndRenderCharts(content);

    // Convert markdown to HTML-like JSX elements
    const lines = textContent.split("\n");
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let currentOrderedList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = "";
    let chartIndex = 0;
    let elementKey = 0;
    let inSourcesSection = false;
    let inSearchDetailsSection = false;
    let sourcePills: { title: string; url: string }[] = [];
    const sourceLinkRegex = /^-\s*\[([^\]]+)\]\(([^)]+)\)\s*$/;

    const getNextKey = () => `element-${elementKey++}`;

    const flushList = () => {
      if (currentOrderedList.length > 0) {
        elements.push(
          <ol
            key={getNextKey()}
            className="list-none space-y-1.5 my-3 text-gray-200 leading-relaxed pl-6"
          >
            {currentOrderedList.map((item, index) => (
              <li key={index} className="flex gap-1.5">
                <span className="shrink-0 font-medium text-purple-400 tabular-nums">
                  {index + 1}.
                </span>
                <span>{formatInlineMarkdown(item, citationPills)}</span>
              </li>
            ))}
          </ol>
        );
        currentOrderedList = [];
      }
      if (currentList.length > 0) {
        elements.push(
          <ul
            key={getNextKey()}
            className="list-disc list-outside pl-5 space-y-2 my-3 text-gray-200 leading-relaxed [&_li::marker]:text-purple-400"
          >
            {currentList.map((item, index) => (
              <li key={index} className="pl-1">
                {formatInlineMarkdown(item, citationPills)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        const blockKey = `code-${getNextKey()}`;
        elements.push(
          <CodeBlock
            key={blockKey}
            content={codeBlockContent.join("\n")}
            language={codeBlockLanguage}
            blockKey={blockKey}
            copiedKey={copiedCodeKey}
            onCopy={(k) => {
              setCopiedCodeKey(k);
              setTimeout(() => setCopiedCodeKey(null), 2000);
            }}
          />
        );
        codeBlockContent = [];
        codeBlockLanguage = "";
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

      // Skip "### 📎 **Sources**" section — not rendered (sources in sidebar/pills only)
      if (line.includes("📎") && line.includes("Sources")) {
        flushList();
        inSourcesSection = true;
        return;
      }
      if (inSourcesSection && sourceLinkRegex.test(line.trim())) {
        const match = line.trim().match(sourceLinkRegex);
        if (match) {
          const [, title, url] = match;
          sourcePills.push({ title, url });
        }
        return;
      }
      if (inSourcesSection) {
        inSourcesSection = false;
        sourcePills = [];
        return;
      }

      // Skip "### 📊 **Search Details**" section
      if (line.includes("📊") && /Search Details/i.test(line)) {
        flushList();
        inSearchDetailsSection = true;
        return;
      }
      if (inSearchDetailsSection) {
        if (line.trim() === "" || line.match(/^#+\s/)) {
          inSearchDetailsSection = false;
        } else {
          return;
        }
      }

      // Handle headers
      if (line.startsWith("#")) {
        flushList();
        const headerText = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
        const level = line.match(/^#+/)?.[0].length || 2;

        if (level === 1) {
          elements.push(
            <h1
              key={getNextKey()}
              className="text-2xl font-bold text-white mt-6 mb-3 leading-tight"
            >
              {headerText}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2
              key={getNextKey()}
              className="text-lg font-semibold text-white mt-5 mb-2 leading-snug"
            >
              {headerText}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3
              key={getNextKey()}
              className="text-base font-semibold text-white mt-4 mb-2 leading-snug"
            >
              {headerText}
            </h3>
          );
        } else {
          elements.push(
            <h4
              key={getNextKey()}
              className="text-sm font-semibold text-white mt-3 mb-1.5 leading-snug"
            >
              {headerText}
            </h4>
          );
        }
        return;
      }

      // Handle bullet points (unordered)
      if (line.match(/^[•\-\*]\s/)) {
        if (currentOrderedList.length > 0) {
          flushList();
        }
        const listItem = line.replace(/^[•\-\*]\s*/, "");
        currentList.push(listItem);
        return;
      }

      // Handle numbered lists (ordered) – accumulate into one <ol>
      if (line.match(/^\d+\.\s/)) {
        if (currentList.length > 0) {
          flushList();
        }
        const listItem = line.replace(/^\d+\.\s*/, "");
        currentOrderedList.push(listItem);
        return;
      }

      if (line.trim() === "") {
        const nextLine = lines[index + 1];
        const nextIsNumbered = nextLine?.match(/^\d+\.\s/);
        const nextIsBullet = nextLine?.match(/^[•\-\*]\s/);
        const listContinues =
          (nextIsNumbered && currentOrderedList.length > 0) ||
          (nextIsBullet && currentList.length > 0);
        if (!listContinues) {
          flushList();
        }
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
          <p key={getNextKey()} className="text-gray-200 leading-[1.65] my-2.5">
            {formatInlineMarkdown(line, citationPills)}
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

  const renderHtmlLike = (formatted: string): React.ReactNode => {
    const parts = formatted.split(/(<[^>]+>)/);
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < parts.length) {
      const part = parts[i];
      if (part.startsWith("<strong>")) {
        const content = part.replace(/<\/?strong>/g, "");
        elements.push(<strong key={i} className="font-semibold text-white">{content}</strong>);
      } else if (part.startsWith("<em>")) {
        const content = part.replace(/<\/?em>/g, "");
        elements.push(<em key={i} className="italic text-gray-300">{content}</em>);
      } else if (part.startsWith("<code")) {
        const content = part.replace(/<code[^>]*>|<\/code>/g, "");
        elements.push(<code key={i} className="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-xs font-mono text-[#9cdcfe]">{content}</code>);
      } else if (part.startsWith("<a")) {
        const hrefMatch = part.match(/href="([^"]+)"/);
        const textMatch = part.match(/>([^<]+)</);
        if (hrefMatch && textMatch) {
          elements.push(
            <a key={i} href={sanitizeHref(hrefMatch[1])} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {textMatch[1]}
            </a>
          );
        }
      } else if (!part.match(/^<[^>]+>$/)) {
        elements.push(<Fragment key={i}>{part}</Fragment>);
      }
      i++;
    }
    return elements.length > 1 ? <>{elements}</> : elements[0] || formatted;
  };

  const formatInlineMarkdown = (text: string, asCitationPills?: boolean): React.ReactNode => {
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

    const renderLinkPill = (title: string, url: string) => {
      let domain = "";
      try {
        if (url.startsWith("http")) domain = new URL(url).hostname.replace(/^www\./, "");
      } catch {}
      const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
      return (
        <a
          href={sanitizeHref(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-mono bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white transition-colors align-middle"
        >
          {faviconUrl && <img src={faviconUrl} alt="" className="w-3 h-3 rounded-sm flex-shrink-0" />}
          <span className="truncate max-w-[25ch]">{title}</span>
        </a>
      );
    };

    const processWithoutLinks = (s: string) => {
      let f = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      f = f.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      f = f.replace(/`([^`]+)`/g, '<code class="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-xs font-mono text-[#9cdcfe]">$1</code>');
      f = f.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
      return f;
    };

    if (asCitationPills) {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      const re = new RegExp(linkRe.source, "g");
      while ((match = re.exec(text)) !== null) {
        const before = text.slice(lastIndex, match.index);
        if (before) parts.push(renderHtmlLike(processWithoutLinks(before)));
        const [, title, url] = match;
        parts.push(renderLinkPill(title, url));
        lastIndex = match.index + match[0].length;
      }
      const after = text.slice(lastIndex);
      if (after) parts.push(renderHtmlLike(processWithoutLinks(after)));
      return parts.length > 1 ? <>{parts.map((part, i) => <Fragment key={i}>{part}</Fragment>)}</> : parts[0] ?? text;
    }

    let formatted = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-xs font-mono text-[#9cdcfe]">$1</code>'
    );
    formatted = formatted.replace(
      linkRe,
      '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return renderHtmlLike(formatted);
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

  const handleSend = async (isFromWelcomeScreen = false, overrideInput?: string) => {
    const currentInput = overrideInput ?? input;
    if (!currentInput.trim() || isLoading) return;
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

    if (editingMessageIndex !== null) {
      setMessages(prev => [...prev.slice(0, editingMessageIndex), userMessage]);
      setEditingMessageIndex(null);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    if (!overrideInput) setInput('');
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
          data: [], 
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
          user_id: session?.user?.id || (session?.user?.email as string) || 'anonymous',
          user_email: (session?.user?.email as string) || '', // For Arcade OAuth (needs email, not ID) - use empty string instead of null
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
        } : undefined,
        ...(result.authorization_required && result.authorization_url && {
          authorizationUrl: result.authorization_url,
          authorizationMessage: result.authorization_message || 'Connect your account so the agent can read your data.',
        }),
        ...(result.questions && {
          questions: result.questions,
          needsInfo: result.needs_info || true,
        }),
        ...(result.model_used != null && { model_used: formatModelLabel(result.model_used) }),
        ...(result.token_count != null && { token_count: result.token_count }),
        ...(result.web_search_used && {
          web_search_used: true,
          webSources: (result.web_sources?.length
            ? result.web_sources.map((s: { title: string; url: string; snippet?: string }) => ({ title: s.title, url: s.url, snippet: s.snippet }))
            : extractWebSourcesFromContent(responseContent)),
        }),
      };

      // If backend says the user sent a secret (e.g. Stripe key), redact it in the UI and in saved messages
      const userContentToSave = result.redact_user_message ? 'Stripe key added' : currentInput;
      setMessages(prev => {
        let next = [...prev];
        if (result.redact_user_message) {
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === 'user') {
              next[i] = { ...next[i], content: 'Stripe key added' };
              break;
            }
          }
        }
        return [...next, assistantMessage];
      });
  
  
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
          userContentToSave,
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
            analysis_results: result.analysis_results,
            ...(result.web_search_used && {
              web_search_used: true,
              webSources: (result.web_sources || []).map((s: { title: string; url: string; snippet?: string }) => ({ title: s.title, url: s.url, snippet: s.snippet })),
            }),
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
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend(showWelcome);
    }
  };

  // Ctrl+/ or Cmd+/ to focus input (#18)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (showWelcome && welcomeTextareaRef.current) {
          welcomeTextareaRef.current.focus();
        } else if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showWelcome]);

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

  const handleRetry = (assistantIndex: number) => {
    const userMessage = messages[assistantIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;
    setMessages((prev) => prev.slice(0, assistantIndex - 1));
    handleSend(false, userMessage.content);
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
          className="bg-green-500/20 text-green-400"
        >
          <Database className="h-3 w-3 mr-1" />
          {dataContext?.rowCount?.toLocaleString()} rows
        </Badge>
        <Badge
          variant="secondary"
          className="bg-blue-500/20 text-blue-400"
        >
          <FileText className="h-3 w-3 mr-1" />
          {dataContext?.totalColumns} columns
        </Badge>
        <Badge
          variant="secondary"
          className="bg-purple-500/20 text-purple-400"
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
              className="w-full bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 resize-none min-h-[70px] text-lg rounded-3xl pl-8 pr-24 py-6 transition-all duration-300 border-0 focus:ring-0 focus-visible:ring-0"
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
                      className="bg-orange-500/20 text-orange-400"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No Data
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto scrollbar-hidden relative z-10">
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
                <div className="mb-6 p-4 bg-blue-500/10 rounded-lg max-w-2xl mx-auto">
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
                    className="w-full bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 resize-none min-h-[70px] max-h-[200px] text-lg rounded-3xl pl-8 pr-32 py-6 pb-20 border-0 focus:ring-2 focus:ring-blue-500/50 focus:border-0 transition-all duration-300 group-hover:bg-white/10 overflow-y-auto"
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
                      className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
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
                    className={`group relative text-left p-6 rounded-2xl transition-all duration-300 ${
                      !hasData &&
                      example.title !== "Upload Data" &&
                      example.title !== "Supported Formats" &&
                      example.title !== "Analysis Types"
                        ? "bg-white/5 opacity-50 cursor-not-allowed"
                        : "bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-105 cursor-pointer"
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
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300`}>
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
          <div className="bg-blue-500/10 rounded-lg p-3">
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
                            ({Math.round((analysis.score ?? analysis.similarity_score ?? 0) * 100)}% similar)
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

      <div className="flex-1 overflow-y-auto scrollbar-hidden p-6 relative z-10">
        <div
          className={`mx-auto space-y-8 transition-all duration-300 ${
            isSidebarCollapsed ? "max-w-4xl" : "max-w-3xl"
          }`}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 w-full ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "user" && (
                <>
              <div className="max-w-[85%] order-first flex flex-col items-end group">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm text-gray-100 p-4 w-full">
                  <div className="prose prose-sm max-w-none text-current">
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-200">
                      {message.content}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs">
                    {message.timestamp
                      ? new Date(message.timestamp).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : ""}
                  </span>
                  <button
                    onClick={() => {
                      setInput(message.content);
                      setEditingMessageIndex(index);
                      setTimeout(() => textareaRef.current?.focus(), 0);
                    }}
                    className="p-1 hover:text-gray-200 rounded hover:bg-white/5 transition-colors"
                    title="Rewrite"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => copyMessage(message.content, index)}
                    className="p-1 hover:text-gray-200 rounded hover:bg-white/5 transition-colors"
                    title="Copy"
                  >
                    {copiedMessageId === index.toString() ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
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
              </>
              )}

              {message.role === "assistant" && (
                <div className="w-full flex gap-3 group">
                  <div className="w-7 h-7 mt-0.5 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src="/anilyst_logo.svg"
                      alt="Anilyst"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-sm max-w-none text-current text-gray-200 prose-headings:font-semibold prose-p:my-2.5 prose-ul:my-3 prose-ol:my-3 prose-li:my-0.5 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-300 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 [&_table]:block [&_table]:overflow-x-auto">
                      {renderMarkdown(message.content, {
                        citationPills:
                          (message.webSources?.length ?? 0) > 0 ||
                          extractWebSourcesFromContent(message.content).length > 0,
                      })}
                    </div>
                    
                    {message.authorizationUrl && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5">
                        <p className="text-sm text-gray-300 mb-3">
                          {message.authorizationMessage || 'Connect your account so the agent can read and analyze your data.'}
                        </p>
                        <a
                          href={message.authorizationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium transition-all"
                        >
                          Connect account
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <p className="text-xs text-gray-400 mt-2">
                          You’ll be redirected to connect securely. After connecting, try your request again.
                        </p>
                      </div>
                    )}
                    {message.questions && message.questions.length > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-yellow-500/10">
                        <p className="text-sm text-yellow-200 mb-3 font-medium">
                          I need some information to complete this task:
                        </p>
                        <ul className="space-y-2 mb-4">
                          {message.questions.map((q: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-300">
                              {idx + 1}. {q.question}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-400">
                          Please provide the requested information in your next message, and I'll complete the task automatically.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-2">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "AI Response",
                              text: message.content,
                            }).catch(() => copyMessage(message.content, index));
                          } else {
                            copyMessage(message.content, index);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([message.content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `response-${index}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyMessage(message.content, index)}
                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                        title="Copy"
                      >
                        {copiedMessageId === index.toString() ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRetry(index)}
                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                        title="Retry"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      {(() => {
                        const sources =
                          message.webSources?.length
                            ? message.webSources
                            : extractWebSourcesFromContent(message.content);
                        const hasSources = sources.length > 0;
                        const isSourcesActive = sourcesSidebarOpen && sourcesSidebarMessageIndex === index;
                        return hasSources ? (
                          <button
                            onClick={() => {
                              setSourcesSidebarData({
                                sources,
                                query: messages[index - 1]?.role === "user" ? messages[index - 1].content : undefined,
                              });
                              setSourcesSidebarMessageIndex(index);
                              setSourcesSidebarOpen(true);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors ${isSourcesActive ? "bg-white/10" : "hover:bg-white/10"}`}
                            title="View sources"
                          >
                            <span className="flex -space-x-1.5 items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 ring-2 ring-[#0f0f0f]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500/90 ring-2 ring-[#0f0f0f]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-white/95 ring-2 ring-[#0f0f0f] flex items-center justify-center">
                                <span className="flex gap-0.5 items-center">
                                  <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                                  <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                                  <span className="w-0.5 h-0.5 rounded-full bg-gray-600" />
                                </span>
                              </span>
                            </span>
                            <span>{sources.length} source{sources.length !== 1 ? "s" : ""}</span>
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <>
              <div className="flex gap-4 w-full justify-end">
                <div className="max-w-[85%] rounded-2xl bg-white/10  p-4 w-48 h-12 animate-pulse" />
              </div>
              <div className="flex gap-4 w-full justify-start">
                <div className="w-7 h-7 rounded flex-shrink-0 bg-white/10 animate-pulse" />
                <div className="flex-1 max-w-[85%] space-y-2">
                  <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
                  <div className="h-4 bg-white/10 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-white/10 rounded animate-pulse w-4/5" />
                </div>
              </div>
              <div className="flex gap-4 w-full justify-end">
                <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 w-56 h-10 animate-pulse" />
              </div>
            </>
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
              className="w-full bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 resize-none min-h-[60px] max-h-[160px] rounded-2xl pl-6 pr-32 py-4 pb-16 border-0 focus:ring-2 focus:ring-blue-500/50 focus:border-0 transition-all duration-300 overflow-y-auto"
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
                className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/10 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                title="Upload Data"
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-sm font-medium">Add Sources</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Sources sidebar - slides in from right, chat shrinks when open */}
        <div
          className={`flex-shrink-0 flex flex-col bg-[#0f0f0f] overflow-hidden border-l border-white/10 transition-[width] duration-300 ease-out ${
            sourcesSidebarOpen && sourcesSidebarData ? "w-[380px]" : "w-0"
          }`}
          role="complementary"
          aria-label="Sources"
        >
          {sourcesSidebarOpen && sourcesSidebarData && (
          <>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">
                {sourcesSidebarData.sources.length} source{sourcesSidebarData.sources.length !== 1 ? "s" : ""}
              </h3>
              <button
                onClick={() => { setSourcesSidebarOpen(false); setSourcesSidebarMessageIndex(null); }}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sourcesSidebarData.query && (
              <p className="px-4 pb-3 text-sm text-gray-400 truncate flex-shrink-0" title={sourcesSidebarData.query}>
                Sources for: {sourcesSidebarData.query}
              </p>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden px-4 pb-4 space-y-6">
              {sourcesSidebarData.sources.map((source, i) => {
                let domain = "";
                try {
                  if (source.url.startsWith("http")) domain = new URL(source.url).hostname.replace(/^www\./, "");
                } catch {}
                const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
                const sourceName = domain || source.title;
                const sourceUrl = sanitizeHref(source.url);
                return (
                  <div
                    key={i}
                    className="flex gap-3 group py-2 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-transparent"
                    >
                      {faviconUrl ? (
                        <img src={faviconUrl} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <ExternalLink className="w-5 h-5 text-gray-500" />
                      )}
                    </a>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">{sourceName}</p>
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-white group-hover:text-blue-400 transition-colors leading-snug"
                      >
                        {formatInlineMarkdown(source.title)}
                      </a>
                      {source.snippet && (
                        <div className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-3 [&_a]:text-blue-400 [&_a]:hover:underline [&_strong]:font-medium [&_code]:bg-[#2d2d2d] [&_code]:px-1 [&_code]:rounded [&_code]:text-xs">
                          {formatInlineMarkdown(source.snippet)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
          )}
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
