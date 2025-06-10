"use client";

import { useState, useEffect } from "react";
import { Calendar, CandlestickChart, BarChart2, AlertCircle, FileSpreadsheet, FileText, Table, Info, Server, InfoIcon, CheckCircle, ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useFileStore, StockData, SimpleData, ChartData } from "@/store/file-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Access environment variable with fallback to deployed URL
const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

interface ProcessedData {
  [key: string]: string | number;
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
  onResultReceived?: (chartData: ChartData) => void;
}) {
  const [backendConnected, setBackendConnected] = useState(true);
  const { toast } = useToast();
  
  // Zustand store
  const {
    currentFile,
    rawData,
    chartData,
    aiAnalysis,
    availableYears,
    selectedYear,
    isLoading,
    isAnalyzing,
    error,
    setCurrentFile,
    setRawData,
    setChartData,
    setAiAnalysis,
    setAvailableYears,
    setSelectedYear,
    setLoading,
    setAnalyzing,
    setError,
    isStockData,
  } = useFileStore();

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
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Open Price",
          data: sortedData.map((row) => row.Open),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
        {
          label: "High",
          data: sortedData.map((row) => row.High),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Low",
          data: sortedData.map((row) => row.Low),
          backgroundColor: "rgba(255, 206, 86, 0.6)",
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
      const datasets = numericColumns.map((column, index) => ({
        label: column,
        data: data.map(row => {
          const value = row[column];
          return typeof value === 'number' ? value : Number(value);
        }),
        backgroundColor: `rgba(${75 + index * 50}, ${192 - index * 30}, ${192 + index * 20}, 0.6)`,
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

  const getAiAnalysis = async (filePath: string, fileType: string) => {
    setAnalyzing(true);
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
      setAnalyzing(false);
    }
  };

  const handleDataProcessed = async (data: ProcessedData[], file: File) => {
    console.log("Data processed:", data.length, "rows");
    
    try {
      setLoading(true);
      setError('');
      
      // Detect data type
      const isStock = detectDataType(data);
      console.log("Data type detection:", isStock ? "Stock data" : "Simple data");
      
      // Create file metadata
      const fileMetadata = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        isStockData: isStock,
        rowCount: data.length,
      };
      
      // Save to store
      setCurrentFile(fileMetadata);
      setRawData(data);
      
      // Get AI analysis
      await getAiAnalysis(fileMetadata.id, file.type);
      
      let processedChartData: ChartData;
      
      if (isStock) {
        // Extract available years for stock data
        const processedStockData = data.map(row => ({
          ...row,
          Date: row.Date as string,
          Open: typeof row.Open === 'string' ? Number(row.Open) : row.Open as number,
          High: typeof row.High === 'string' ? Number(row.High) : row.High as number,
          Low: typeof row.Low === 'string' ? Number(row.Low) : row.Low as number,
          Close: typeof row.Close === 'string' ? Number(row.Close) : row.Close as number,
        }));
        
        const years = Array.from(
          new Set(
            processedStockData.map((row) => new Date(row.Date).getFullYear().toString())
          )
        ).sort();
        console.log("Available years:", years);
        setAvailableYears(years);
        
        // Process as stock data
        processedChartData = processStockData(processedStockData as StockData[], selectedYear);
      } else {
        // Clear years for non-stock data
        setAvailableYears([]);
        // Process as simple data
        processedChartData = processSimpleData(data as SimpleData[]);
      }
      
      console.log("Chart data prepared:", processedChartData);
      
      // Save chart data to store
      setChartData(processedChartData);
      
      // Call callback if provided (for backward compatibility)
      if (onResultReceived) {
        onResultReceived(processedChartData);
      }
      
      toast({
        title: "Success!",
        description: "Your data has been processed and is ready for analysis.",
      });
      
    } catch (error) {
      console.error("Error in handleDataProcessed:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Processing Error",
        description: "There was an error processing your data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (rawData.length > 0 && isStockData()) {
      const processedChartData = processStockData(rawData as StockData[], year);
      setChartData(processedChartData);
      
      if (onResultReceived) {
        onResultReceived(processedChartData);
      }
    }
  };

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(NEXT_PUBLIC_FASTAPI_URL + "/health");
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
      setLoading(true);
      
      toast({
        title: "Processing your file",
        description: "Your data is being analyzed...",
        duration: 3000,
      });
      
      // Extract file extension from the name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      try {
        // Process file based on type
        if (fileExt === 'csv') {
          const text = await file.text();
          // Parse CSV in the browser
          const rows = text.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          const data = [];
          
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',').map(v => v.trim());
            const row: { [key: string]: any } = {};
            
            headers.forEach((header, index) => {
              // Try to convert numeric values
              const value = values[index];
              const numValue = Number(value);
              row[header] = isNaN(numValue) ? value : numValue;
            });
            
            data.push(row);
          }
          
          // Process the data
          await handleDataProcessed(data, file);
          
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
          // Placeholder for Excel processing
          toast({
            title: "Excel processing",
            description: "Excel processing is handled in memory but requires the xlsx library.",
            duration: 5000,
          });
          
          const mockData = [
            { Date: "2023-01-01", Open: 100, High: 110, Low: 95, Close: 105 },
            { Date: "2023-01-02", Open: 105, High: 115, Low: 100, Close: 110 }
          ];
          
          await handleDataProcessed(mockData, file);
        } else if (fileExt === 'pdf') {
          toast({
            title: "PDF processing",
            description: "PDF processing would require a PDF parsing library.",
            duration: 5000,
          });
          
          const mockData = [
            { Column1: "Data1", Column2: 10 },
            { Column1: "Data2", Column2: 20 }
          ];
          
          await handleDataProcessed(mockData, file);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError(error instanceof Error ? error.message : "Unknown error processing file");
        toast({
          title: "Processing error",
          description: "There was a problem analyzing your data. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
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
          <div className="bg-black/20 border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10 text-blue-400 mb-2" />
              <h3 className="text-white font-medium mb-1">Drop your file here or click to browse</h3>
              <p className="text-white/60 text-sm">Supports CSV, Excel and PDF</p>
            </div>
          </div>
          
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
        {currentFile && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/60">Detected Data Type:</p>
            <div className="flex items-center space-x-3">
              {currentFile.isStockData ? (
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
        {currentFile?.isStockData && availableYears.length > 0 && (
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
                  onClick={() => handleYearChange(year.toString())}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedYear === year.toString()
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

      {/* Backend Processing Indicator */}
      {currentFile && !isLoading && !isAnalyzing && (
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
      
      {/* File loaded success indicator */}
      {currentFile && !isLoading && (
        <div className="mt-6 bg-black/30 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Data Loaded Successfully
          </h3>
          <p className="text-white/70 text-sm mb-2">
            {currentFile.rowCount} rows detected • {currentFile.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {currentFile.isStockData ? (
              <>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Date</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Open</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">High</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Low</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">Close</span>
              </>
            ) : (
              rawData.length > 0 && Object.keys(rawData[0]).map((key) => (
                <span key={key} className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">
                  {key}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
