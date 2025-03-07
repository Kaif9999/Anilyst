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
    <motion.div
      className="backdrop-blur-md bg-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"></div>
      
      {/* Content */}
      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">Data Analysis Hub</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload your data files for AI-powered analysis and visualization. We support multiple file formats for your convenience.
          </p>
        </div>

        {/* File Type Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: <FileSpreadsheet className="w-6 h-6" />,
              title: "Excel Files",
              description: "Upload .xlsx or .xls files with structured data",
              format: ".xlsx, .xls"
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: "CSV Files",
              description: "Simple comma-separated value files",
              format: ".csv"
            },
            {
              icon: <Table className="w-6 h-6" />,
              title: "PDF Tables",
              description: "PDFs containing tabular data",
              format: ".pdf"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/10 rounded-lg text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  <p className="text-xs text-blue-400 mt-2 font-mono">{item.format}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Size Limit Info */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-6">
          <Info className="w-4 h-4" />
          <span>Maximum file size: 75MB</span>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <FileUpload onDataProcessed={handleDataProcessed} />
          
          {error && (
            <motion.div
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Data Type Indicator */}
        {parsedData.length > 0 && !error && (
          <motion.div
            className="flex items-center justify-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-gray-400">Detected Format:</span>
            {isStockData ? (
              <>
                <CandlestickChart className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Stock Market Data</span>
              </>
            ) : (
              <>
                <BarChart2 className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">General Data</span>
              </>
            )}
          </motion.div>
        )}

        {/* Year Selection */}
        {availableYears.length > 0 && isStockData && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-white font-medium text-center">Filter by Year</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <motion.button
                type="button"
                onClick={() => handleYearChange("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedYear === "all"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Years
              </motion.button>
              {availableYears.map((year) => (
                <motion.button
                  key={year}
                  type="button"
                  onClick={() => handleYearChange(year)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedYear === year
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  {year}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis Section */}
        {isAnalyzing && (
          <motion.div
            className="flex items-center justify-center space-x-3 p-6 bg-white/5 rounded-xl border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-white">AI is analyzing your data...</span>
          </motion.div>
        )}

        {aiAnalysis && (
          <motion.div
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">AI Analysis</h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 space-y-4 whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
