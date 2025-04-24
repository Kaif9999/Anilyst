"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { useFileStorage } from "./input-section";
import { toast } from "@/components/ui/use-toast";

const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB in bytes
const ALLOWED_FILE_TYPES = ['.csv', '.xlsx', '.xls', '.pdf'];

interface ProcessedData {
  [key: string]: string | number;
}

interface FileUploadProps {
  onDataProcessed: (data: ProcessedData[], file: File) => void;
  isLoading?: boolean;
  className?: string;
}

export default function FileUpload({ 
  onDataProcessed, 
  isLoading = false,
  className = ""
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { addFile } = useFileStorage();

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 75MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      throw new Error("Invalid file type. Please upload CSV, Excel, or PDF files");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      try {
        validateFile(selectedFile);
        setFile(selectedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error processing file");
        setFile(null);
        if (e.target) e.target.value = ''; // Reset input
      }
    }
  };

  const processCSV = (file: File): Promise<ProcessedData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error("Error parsing CSV file"));
            return;
          }
          resolve(results.data as ProcessedData[]);
        },
        error: (error) => reject(error),
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
    });
  };

  const processExcel = async (file: File): Promise<ProcessedData[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Get the first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false, // Convert all data to strings
        dateNF: 'yyyy-mm-dd' // Format dates consistently
      });
      
      // Process the data to ensure it has headers
      const headers = jsonData[0] as string[];
      if (!headers || headers.length === 0) {
        throw new Error("No headers found in Excel file");
      }

      const data = jsonData.slice(1).map((row: any) => {
        const obj: ProcessedData = {};
        headers.forEach((header, index) => {
          let value = row[index];
          // Try to convert numeric strings to numbers
          if (typeof value === 'string' && !isNaN(Number(value))) {
            value = Number(value);
          }
          obj[header] = value || '';
        });
        return obj;
      });

      if (data.length === 0) {
        throw new Error("No data rows found in Excel file");
      }

      return data;
    } catch (error) {
      throw new Error(`Error processing Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const processPDF = async (file: File): Promise<ProcessedData[]> => {
    try {
      // Initialize PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let textContent = '';
      
      // Extract text from all pages
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        // Make sure all items are properly typed
        const pageText = content.items
          .map((item: any) => typeof item.str === 'string' ? item.str : String(item.str))
          .join(' ');
        textContent += pageText + '\n';
      }

      // Try to detect table structure in the text
      const lines = textContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        throw new Error("No readable text found in PDF");
      }

      // Try to detect table structure (comma, tab, or multiple spaces separated)
      const possibleDelimiters = [/\t/, /\s{2,}/, /,/];
      let headers: string[] = [];
      let delimiter: RegExp | null = null;

      // Find the most likely delimiter
      for (const d of possibleDelimiters) {
        const split = lines[0].split(d).map(h => h.trim()).filter(h => h);
        if (split.length > headers.length) {
          headers = split;
          delimiter = d;
        }
      }

      if (!delimiter || headers.length <= 1) {
        throw new Error("Could not detect table structure in PDF");
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(delimiter!).map(value => value.trim());
        return headers.reduce((obj: ProcessedData, header, index) => {
          let value: string | number = values[index] || '';
          // Try to convert numeric strings to numbers
          if (typeof value === 'string' && !isNaN(Number(value))) {
            obj[header] = Number(value);
          } else {
            obj[header] = String(value);
          }
          return obj;
        }, {});
      });

      return data;
    } catch (error) {
      throw new Error(`Error processing PDF: ${error instanceof Error ? error.message : "Unknown error"}. Make sure the PDF contains table-like data.`);
    }
  };

  const processFile = async (file: File) => {
    try {
      // Store the file in memory storage first
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addFile(fileId, file);
      
      // Process based on file type
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let processedData: ProcessedData[] = [];
      
      if (fileType === 'csv') {
        processedData = await processCSV(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        processedData = await processExcel(file);
      } else if (fileType === 'pdf') {
        processedData = await processPDF(file);
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload a CSV, Excel, or PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      // Call onDataProcessed with the processed data
      if (processedData.length > 0) {
        onDataProcessed(processedData, file);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error processing the file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError("");

    try {
      await processFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="file" className="text-white/60">Upload Data File</Label>
        <Input 
          id="file" 
          type="file" 
          accept=".csv,.xlsx,.xls,.pdf" 
          onChange={handleFileChange}
          disabled={isLoading || isProcessing}
          className="cursor-pointer bg-black/20 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-sm text-white/40">
          Maximum file size: 75MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={!file || isProcessing || isLoading}
        className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing || isLoading ? "Processing..." : "Analyze Data"}
      </Button>
    </div>
  );
}