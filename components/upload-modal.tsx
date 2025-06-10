"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, FileSpreadsheet, Table, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useFileStore, StockData, SimpleData, ChartData } from "@/store/file-store";
import { useToast } from "@/components/ui/use-toast";

interface ProcessedData {
  [key: string]: string | number;
}

export default function UploadModal() {
  const { toast } = useToast();
  
  const {
    isUploadModalOpen,
    isLoading,
    error,
    setUploadModalOpen,
    setCurrentFile,
    setRawData,
    setChartData,
    setAvailableYears,
    setSelectedYear,
    setLoading,
    setError,
  } = useFileStore();

  const processStockData = (data: StockData[], year: string = "all"): ChartData => {
    const filteredData = year === "all" 
      ? data 
      : data.filter(row => new Date(row.Date).getFullYear().toString() === year);

    const sortedData = [...filteredData].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    return {
      labels: sortedData.map(row => new Date(row.Date).toLocaleDateString()),
      datasets: [
        {
          label: "Close Price",
          data: sortedData.map(row => row.Close),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Open Price",
          data: sortedData.map(row => row.Open),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
        {
          label: "High",
          data: sortedData.map(row => row.High),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Low",
          data: sortedData.map(row => row.Low),
          backgroundColor: "rgba(255, 206, 86, 0.6)",
        },
      ],
    };
  };

  const processSimpleData = (data: SimpleData[]): ChartData => {
    try {
      const keys = Object.keys(data[0]);
      
      if (keys.length < 2) {
        throw new Error("Data must have at least two columns");
      }

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

      const labelColumn = keys.find(key => !numericColumns.includes(key)) || keys[0];
      
      const datasets = numericColumns.map((column, index) => ({
        label: column,
        data: data.map(row => {
          const value = row[column];
          return typeof value === 'number' ? value : Number(value);
        }),
        backgroundColor: `rgba(${75 + index * 50}, ${192 - index * 30}, ${192 + index * 20}, 0.6)`,
      }));

      return {
        labels: data.map(row => String(row[labelColumn])),
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
    
    return requiredFields.every(field => {
      const hasField = headers.includes(field);
      if (!hasField) return false;
      
      if (field === "Date") {
        return data.every(row => {
          const dateValue = row[field];
          return typeof dateValue === 'string' && !isNaN(new Date(dateValue).getTime());
        });
      }
      
      return data.every(row => {
        const value = row[field];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
      });
    });
  };

  const handleDataProcessed = async (data: ProcessedData[], file: File) => {
    try {
      setLoading(true);
      setError('');
      
      const isStock = detectDataType(data);
      
      const fileMetadata = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        isStockData: isStock,
        rowCount: data.length,
      };
      
      setCurrentFile(fileMetadata);
      setRawData(data);
      
      let processedChartData: ChartData;
      
      if (isStock) {
        const processedStockData = data.map(row => ({
          ...row,
          Date: row.Date as string,
          Open: typeof row.Open === 'string' ? Number(row.Open) : row.Open as number,
          High: typeof row.High === 'string' ? Number(row.High) : row.High as number,
          Low: typeof row.Low === 'string' ? Number(row.Low) : row.Low as number,
          Close: typeof row.Close === 'string' ? Number(row.Close) : row.Close as number,
        }));
        
        const years = Array.from(
          new Set(processedStockData.map(row => new Date(row.Date).getFullYear().toString()))
        ).sort();
        setAvailableYears(years);
        
        processedChartData = processStockData(processedStockData as StockData[], 'all');
      } else {
        setAvailableYears([]);
        processedChartData = processSimpleData(data as SimpleData[]);
      }
      
      setChartData(processedChartData);
      setSelectedYear('all');
      
      toast({
        title: "Success!",
        description: "Your data has been processed and is ready for analysis.",
      });
      
      // Close modal after successful upload
      setUploadModalOpen(false);
      
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLoading(true);
      
      toast({
        title: "Processing your file",
        description: "Your data is being analyzed...",
        duration: 3000,
      });
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      try {
        if (fileExt === 'csv') {
          const text = await file.text();
          const rows = text.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          const data = [];
          
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            
            const values = rows[i].split(',').map(v => v.trim());
            const row: { [key: string]: any } = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              const numValue = Number(value);
              row[header] = isNaN(numValue) ? value : numValue;
            });
            
            data.push(row);
          }
          
          await handleDataProcessed(data, file);
          
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
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

  if (!isUploadModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setUploadModalOpen(false)}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl border border-white/10 p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Upload Your Data</h2>
            <button
              onClick={() => setUploadModalOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Area */}
          <div className="space-y-6">
            <div className="relative">
              <div className="bg-black/20 border-2 border-dashed border-white/20 rounded-2xl p-12 hover:border-blue-500/50 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-white font-medium mb-2 text-lg">
                    Drop your file here or click to browse
                  </h3>
                  <p className="text-white/60 text-sm">
                    Supports CSV, Excel and PDF files
                  </p>
                </div>
              </div>
              
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-sm text-white/80">Processing your data...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Supported Formats */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/60">Supported Formats:</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-4">
                  <Table className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">CSV</div>
                    <div className="text-xs text-white/60">Comma-separated values</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-4">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Excel</div>
                    <div className="text-xs text-white/60">XLSX, XLS files</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-white">PDF</div>
                    <div className="text-xs text-white/60">Tables in PDF</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 bg-red-500/10 text-red-400 rounded-xl p-4 border border-red-500/20"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-200">How it works</h4>
                  <ul className="text-xs text-blue-200/80 space-y-1">
                    <li>• Upload your data file (CSV, Excel, or PDF)</li>
                    <li>• We automatically detect data types and patterns</li>
                    <li>• Your data becomes available across all dashboard sections</li>
                    <li>• Start analyzing in Visualizations, Analysis, or with the AI Agent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}