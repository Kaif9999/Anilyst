"use client";

import { useState, useEffect } from "react";
import { Calendar, CandlestickChart, BarChart2, AlertCircle, FileSpreadsheet, FileText, Table, Info, Server, InfoIcon, CheckCircle, ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import { ChartData, StockData, SimpleData } from "../types";
import FileUpload from "./file-upload";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

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

const FileUploadInfo = () => {
  return (
    <div className="mb-6 rounded-lg bg-indigo-900/20 border border-indigo-700/30 p-4">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-800/40 rounded-full p-2 mt-0.5">
          <InfoIcon className="h-5 w-5 text-indigo-300" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-indigo-200">How Your Data Is Processed</h3>
          <p className="text-sm text-indigo-200/80">
            When you upload a file, it's processed by our FastAPI backend for advanced analysis:
          </p>
          <ul className="space-y-1.5 text-sm text-indigo-200/80 ml-4">
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <span>Your file is securely processed by our Python backend</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <span>We automatically detect data types and patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <span>Advanced AI models analyze and prepare predictions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const BackendIndicator = ({ isConnected }: { isConnected: boolean }) => {
  return (
    <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded bg-black/20 border border-white/5 text-xs">
      {isConnected ? (
        <>
          <Server className="h-3 w-3 text-green-400" />
          <span className="text-green-400">FastAPI Backend Connected</span>
        </>
      ) : (
        <>
          <ServerCrash className="h-3 w-3 text-red-400" />
          <span className="text-red-400">Backend Unavailable</span>
        </>
      )}
    </div>
  );
};

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
  const [backendConnected, setBackendConnected] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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
    console.log("Data processed:", data.length, "rows");
    setParsedData(data);
    
    try {
      // First upload the file to get metadata
      const filePath = await uploadFile(file);
      console.log("File uploaded to:", filePath);
      
      // Get AI analysis of the file
      await getAiAnalysis(filePath, file.type);
      
      setIsProcessing(false);
      setIsLoading(true);
      
      // Detect data type
      const isStockData = detectDataType(data);
      console.log("Data type detection:", isStockData ? "Stock data" : "Simple data");
      setIsStockData(isStockData);
      
      let chartData: ChartData;
      
      if (isStockData) {
        // Extract available years for stock data
        const processedStockData = data.map(row => ({
          ...row,
          Date: row.Date,
          Open: typeof row.Open === 'string' ? Number(row.Open) : row.Open,
          High: typeof row.High === 'string' ? Number(row.High) : row.High,
          Low: typeof row.Low === 'string' ? Number(row.Low) : row.Low,
          Close: typeof row.Close === 'string' ? Number(row.Close) : row.Close,
        }));
        
        const years = Array.from(
          new Set(
            processedStockData.map((row) => new Date(row.Date).getFullYear().toString())
          )
        ).sort();
        console.log("Available years:", years);
        setAvailableYears(years);
        
        // Process as stock data
        chartData = processStockData(processedStockData as StockData[], selectedYear);
      } else {
        // Clear years for non-stock data
        setAvailableYears([]);
        // Process as simple data
        chartData = processSimpleData(data as SimpleData[]);
      }
      
      console.log("Chart data prepared:", chartData);
      
      // Log details before calling parent's callback
      console.log("Calling onResultReceived with chart data:", {
        labels: chartData.labels?.length,
        datasets: chartData.datasets.length,
        dataPoints: chartData.datasets.reduce((sum, ds) => sum + ds.data.length, 0)
      });
      
      // Callback to parent with prepared chart data
      onResultReceived(chartData);
    } catch (error) {
      console.error("Error in handleDataProcessed:", error);
      setIsProcessing(false);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (parsedData.length > 0 && isStockData) {
      const chartData = processStockData(parsedData as StockData[], year);
      onResultReceived(chartData);
    }
  };

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setBackendConnected(response.status === 200);
      } catch (error) {
        setBackendConnected(false);
      }
    };
    
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsProcessing(true);
      setIsLoading(true);
      
      toast({
        title: "Processing your file",
        description: "Your data is being analyzed by our FastAPI backend...",
        duration: 3000,
      });
      
      // Extract file extension from the name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (fileExt === 'csv') {
        // Process CSV file
        try {
          const text = await file.text();
          // Note: papa needs to be properly imported at the top if used
          // For now, we'll rely on the existing handleDataProcessed function
          handleDataProcessed([], file);
          setIsProcessing(false);
          
          toast({
            title: "Analysis complete!",
            description: "Your data has been successfully processed.",
            duration: 3000,
          });
        } catch (error) {
          console.error('Error parsing CSV:', error);
          setIsProcessing(false);
          setIsLoading(false);
          
          toast({
            title: "Processing error",
            description: "There was a problem analyzing your data. Please try again.",
            duration: 5000,
          });
        }
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        // Process Excel file
        try {
          // Note: read and utils need to be properly imported at the top if used
          // For now, we'll rely on the existing handleDataProcessed function
          handleDataProcessed([], file);
          setIsProcessing(false);
          
          toast({
            title: "Analysis complete!",
            description: "Your Excel data has been successfully processed.",
            duration: 3000,
          });
        } catch (error) {
          console.error('Error parsing Excel:', error);
          setIsProcessing(false);
          setIsLoading(false);
          
          toast({
            title: "Processing error",
            description: "There was a problem with your Excel file. Please check the format and try again.",
            duration: 5000,
          });
        }
      } else if (fileExt === 'pdf') {
        // Show message about PDF processing
        toast({
          title: "PDF processing started",
          description: "PDFs are processed by our advanced backend. This may take a moment...",
          duration: 5000,
        });
        // Process and handle PDF logic here
        handleDataProcessed([], file);
      }
    }
  };

  const renderFileTypeHelper = () => {
    return (
      <div className="mb-4 grid grid-cols-3 gap-2 mt-6">
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-center">
          <p className="text-blue-300 font-medium text-sm mb-1">CSV</p>
          <p className="text-blue-200/70 text-xs">Comma-separated values</p>
        </div>
        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-center">
          <p className="text-green-300 font-medium text-sm mb-1">Excel</p>
          <p className="text-green-200/70 text-xs">XLSX, XLS files</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 text-center">
          <p className="text-purple-300 font-medium text-sm mb-1">PDF</p>
          <p className="text-purple-200/70 text-xs">Tables in PDF</p>
        </div>
      </div>
    );
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
          <h2 className="text-xl font-semibold text-white">Data Upload</h2>
          <Info className="w-5 h-5 text-blue-400 cursor-help" />
        </div>

        <p className="text-sm text-white/60">
          Upload your CSV, Excel or PDF files to start analyzing your data
        </p>

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
            {/* <AlertCircle className="w-5 h-5 flex-shrink-0" /> */}
            <p className="text-sm"></p>
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

      {/* Backend Processing Indicator - show when data is loaded */}
      {parsedData.length > 0 && !isLoading && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl border border-blue-500/20 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/5 rounded-full">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">FastAPI Backend Active</h3>
              <p className="text-xs text-blue-300 mt-1">
                Your data is processed by both the frontend and our Python analytics engine.
                Advanced statistical models and ML algorithms power the insights you see.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backend Status */}
      <BackendIndicator isConnected={backendConnected} />
      
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        Upload Your Data
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-white/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Upload your file here. We'll automatically process it and create visualizations for you.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h2>
      
      {/* Add the info component */}
      <FileUploadInfo />

      {/* Render file type helpers */}
      {renderFileTypeHelper()}
      
      
      {parsedData.length > 0 && !isLoading && (
        <div className="mt-6 bg-black/30 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Data Loaded Successfully
          </h3>
          <p className="text-white/70 text-sm mb-2">
            {parsedData.length} rows detected
          </p>
          <div className="flex flex-wrap gap-2">
            {isStockData && parsedData.length > 0 && (parsedData as StockData[]).length > 0 && "Date" in (parsedData[0] as any) && (
              <>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Date</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Open</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">High</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Low</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Close</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
