"use client";

import { useState } from "react";
import { Calendar, CandlestickChart, BarChart2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ChartData, StockData, SimpleData } from "../types";
import FileUpload from "./file-upload";

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
        data.every(row => !isNaN(Number(row[key])))
      );

      if (numericColumns.length === 0) {
        throw new Error("No numeric columns found for visualization");
      }

      // Use first non-numeric column as labels, first numeric column as values
      const labelColumn = keys.find(key => !numericColumns.includes(key)) || keys[0];
      const valueColumn = numericColumns[0];

      return {
        labels: data.map((row) => String(row[labelColumn])),
        datasets: [
          {
            label: valueColumn,
            data: data.map((row) => Number(row[valueColumn]) || 0),
            backgroundColor: ["rgba(75, 192, 192, 0.6)"],
          },
        ],
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

  const handleDataProcessed = (data: ProcessedData[]) => {
    setIsLoading(true);
    setError("");
    
    try {
      const isStock = detectDataType(data);
      setIsStockData(isStock);
      setParsedData(data);

      if (isStock) {
        // Extract available years from the data for stock data
        const years = Array.from(
          new Set(
            data.map((row) => new Date(row.Date).getFullYear().toString())
          )
        ).sort();
        setAvailableYears(years);

        const chartData = processStockData(data as StockData[], selectedYear);
        onResultReceived(chartData);
      } else {
        setAvailableYears([]);
        const chartData = processSimpleData(data as SimpleData[]);
        onResultReceived(chartData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error processing data");
      console.error("Error processing data:", error);
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
      className="backdrop-blur-md bg-white bg-opacity-10 p-6 rounded-2xl shadow-neon relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col space-y-4">
          <FileUpload onDataProcessed={handleDataProcessed} />
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {parsedData.length > 0 && !error && (
            <div className="text-white flex items-center space-x-2">
              <span>Data Type:</span>
              {isStockData ? (
                <CandlestickChart className="w-5 h-5 text-green-400" />
              ) : (
                <BarChart2 className="w-5 h-5 text-blue-400" />
              )}
              <span>
                {isStockData ? "Stock Market Data" : "Simple X-Y Data"}
              </span>
            </div>
          )}
        </div>

        {availableYears.length > 0 && isStockData && (
          <div className="flex flex-wrap gap-2">
            <motion.button
              type="button"
              onClick={() => handleYearChange("all")}
              className={`px-4 py-2 rounded-full text-white transition-colors ${
                selectedYear === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
            {availableYears.map((year) => (
              <motion.button
                key={year}
                type="button"
                onClick={() => handleYearChange(year)}
                className={`px-4 py-2 rounded-full text-white transition-colors ${
                  selectedYear === year
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                {year}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
