"use client";

import { useState } from "react";
import { Upload, Calendar, BarChart2, CandlestickChart } from "lucide-react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { ChartData, StockData, SimpleData } from "../types";

export default function InputSection({
  onResultReceived,
}: {
  onResultReceived: (chartData: ChartData) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<StockData[] | SimpleData[]>([]);
  const [isStockData, setIsStockData] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      // Reset states when new file is uploaded
      setSelectedYear("all");
      setAvailableYears([]);
      setParsedData([]);
    }
  };

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
    const keys = Object.keys(data[0]);
    return {
      labels: data.map((row) => String(row[keys[0]])),
      datasets: [
        {
          label: keys[1] || "Value",
          data: data.map((row) => Number(row[keys[1]]) || 0),
          backgroundColor: ["rgba(75, 192, 192, 0.6)"],
        },
      ],
    };
  };

  const detectDataType = (data: unknown[]): boolean => {
    const requiredFields = ["Date", "Open", "High", "Low", "Close"];
    const headers = Object.keys(data[0] || {});
    return requiredFields.every((field) => headers.includes(field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setIsLoading(true);

      try {
        // Read and parse CSV file
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        const data = result.data as any[];
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
        console.error("Error parsing CSV:", error);
      } finally {
        setIsLoading(false);
      }
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
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="flex items-center space-x-4">
          <input
            id="csv"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.label
            htmlFor="csv"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? file.name : "Upload CSV"}
          </motion.label>
          {file && (
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

        <motion.button
          type="submit"
          disabled={!file || isLoading}
          className="w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? "Processing..." : "Generate Chart"}
        </motion.button>
      </form>
    </motion.div>
  );
}
