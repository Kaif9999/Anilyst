"use client";

import { useState } from "react";
import { Calendar, CandlestickChart, BarChart2, AlertCircle, FileSpreadsheet, FileText, Table, Info } from "lucide-react";
import { motion } from "framer-motion";
import { ChartData, StockData, SimpleData } from "../types";
import FileUpload from "./file-upload";
import { useToast } from "@/components/ui/use-toast";

interface ProcessedData {
  [key: string]: string | number;
}

interface DataRow {
  [key: string]: any;
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
}

export default function InputSection({
  onResultReceived,
}: {
  onResultReceived: (chartData: ChartData) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<StockData[] | SimpleData[]>([]);
  const [isStockData, setIsStockData] = useState(true);
  const [error, setError] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const processStockData = (
    data: StockData[],
    year: string = "all"
  ): ChartData => {
    // Filter data by year if specified
    const filteredData =
      year === "all"
        ? data
        : data.filter(
            (row) => new Date(row.Date).getFullYear().toString() === year
          );

    // Sort data by date
    const sortedData = [...filteredData].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    return {
      labels: sortedData.map((row) => new Date(row.Date).toLocaleDateString()),
      datasets: [
        {
          label: "Close Price",
          data: sortedData.map((row) => row.Close),
          backgroundColor: ["rgba(75, 192, 192, 0.6)"],
        },
        {
          label: "Open Price",
          data: sortedData.map((row) => row.Open),
          backgroundColor: ["rgba(255, 99, 132, 0.6)"],
        },
        {
          label: "High",
          data: sortedData.map((row) => row.High),
          backgroundColor: ["rgba(54, 162, 235, 0.6)"],
        },
        {
          label: "Low",
          data: sortedData.map((row) => row.Low),
          backgroundColor: ["rgba(255, 206, 86, 0.6)"],
        },
      ],
    };
  };

  const processSimpleData = (data: SimpleData[]): ChartData => {
    try {
    const keys = Object.keys(data[0]);
      
      // Check if we have at least two columns
      if (keys.length < 2) {
        throw new Error("Data must have at least two columns");
      }

      // Try to detect numeric columns for Y-axis
      const numericColumns = keys.filter(key => 
        data.every(row => {
          const value = row[key];
          return typeof value === 'number' || 
            (typeof value === 'string' && !isNaN(Number(value)));
        })
      );

      if (numericColumns.length === 0) {
        throw new Error("No numeric columns found for visualization");
      }

      // Use first non-numeric column as labels, first numeric column as values
      const labelColumn = keys.find(key => !numericColumns.includes(key)) || keys[0];
      
      // Create datasets for all numeric columns
      const datasets = numericColumns.map(column => ({
        label: column,
        data: data.map(row => {
          const value = row[column];
          return typeof value === 'number' ? value : Number(value);
        }),
        backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`,
      }));

    return {
        labels: data.map((row) => String(row[labelColumn])),
        datasets,
      };
    } catch (error) {
      throw new Error("Error processing data for visualization: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const detectDataType = (data: ProcessedData[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    const requiredFields = ["Date", "Open", "High", "Low", "Close"];
    const headers = Object.keys(data[0] || {});
    
    // Check if all required fields exist and contain valid data
    return requiredFields.every((field) => {
      const hasField = headers.includes(field);
      if (!hasField) return false;
      
      // For Date field, check if it's a valid date
      if (field === "Date") {
        return data.every(row => {
          const dateValue = row[field];
          return typeof dateValue === 'string' && !isNaN(new Date(dateValue).getTime());
        });
      }
      
      // For numeric fields, check if they contain valid numbers
      return data.every(row => {
        const value = row[field];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
      });
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error uploading file");
    }

    const data = await response.json();
    return data.filePath;
  };

  const getAiAnalysis = async (filePath: string, fileType: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath,
          type: fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error getting AI analysis");
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your data. Check the analysis panel below.",
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Error analyzing data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDataProcessed = async (data: ProcessedData[], file: File) => {
      setIsLoading(true);
    setError("");
    
    try {
      // First, process the data for visualization
        const isStock = detectDataType(data);
        setIsStockData(isStock);
        setParsedData(data);

        if (isStock) {
        const processedData = data.map(row => ({
          ...row,
          Date: row.Date,
          Open: typeof row.Open === 'string' ? Number(row.Open) : row.Open,
          High: typeof row.High === 'string' ? Number(row.High) : row.High,
          Low: typeof row.Low === 'string' ? Number(row.Low) : row.Low,
          Close: typeof row.Close === 'string' ? Number(row.Close) : row.Close,
        }));

          const years = Array.from(
            new Set(
            processedData.map((row) => new Date(row.Date).getFullYear().toString())
            )
          ).sort();
          setAvailableYears(years);

        const chartData = processStockData(processedData as StockData[], selectedYear);
          onResultReceived(chartData);
        } else {
          setAvailableYears([]);
          const chartData = processSimpleData(data as SimpleData[]);
          onResultReceived(chartData);
        }

      // Then, upload the file and get AI analysis
      const filePath = await uploadFile(file);
      await getAiAnalysis(filePath, file.type);

      } catch (error) {
      setError(error instanceof Error ? error.message : "Error processing data");
      console.error("Error processing data:", error);
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Error processing data",
        variant: "destructive",
      });
      } finally {
        setIsLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (parsedData.length > 0 && isStockData) {
      const chartData = processStockData(parsedData as StockData[], year);
      onResultReceived(chartData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Data Input</h2>
          <Info className="w-5 h-5 text-blue-400 cursor-help" />
        </div>

        {/* File Upload Area */}
        <div className="relative">
          <FileUpload
            onDataProcessed={handleDataProcessed}
            isLoading={isLoading}
            className="bg-black/20 border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-blue-500/50 transition-colors"
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-sm text-white/80">Processing your data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Supported Formats */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/60">Supported Formats:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-3">
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white/80">Excel (.xlsx)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-3">
              <Table className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white/80">CSV (.csv)</span>
            </div>
          </div>
        </div>

        {/* Data Type Indicators */}
        {parsedData.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/60">Detected Data Type:</p>
            <div className="flex items-center space-x-3">
              {isStockData ? (
                <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 rounded-xl px-4 py-2">
                  <CandlestickChart className="w-4 h-4" />
                  <span className="text-sm font-medium">Stock Data</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-blue-500/10 text-blue-400 rounded-xl px-4 py-2">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-sm font-medium">General Data</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Year Selection for Stock Data */}
        {isStockData && availableYears.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/60">Filter by Year:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleYearChange("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedYear === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                All Years
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 bg-red-500/10 text-red-400 rounded-xl p-4"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-500/10 backdrop-blur-lg rounded-3xl border border-blue-500/20 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <p className="text-sm text-blue-400">AI is analyzing your data...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
