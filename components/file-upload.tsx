"use client";

import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pdfjs from 'pdfjs-dist';

const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB in bytes
const ALLOWED_FILE_TYPES = ['.csv', '.xlsx', '.xls', '.pdf'];

interface ProcessedData {
  [key: string]: string | number;
}

export default function FileUpload({ onDataProcessed }: { onDataProcessed: (data: ProcessedData[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Process the data to ensure it has headers
      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1).map((row: any) => {
        const obj: ProcessedData = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return data;
    } catch (error) {
      throw new Error("Error processing Excel file");
    }
  };

  const processPDF = async (file: File): Promise<ProcessedData[]> => {
    try {
      // Initialize PDF.js worker
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let textContent = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
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

      // Try to detect CSV-like structure (comma or tab separated)
      const headers = lines[0].split(/[,\t]/).map(header => header.trim());
      
      if (headers.length <= 1) {
        throw new Error("Could not detect table structure in PDF");
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(/[,\t]/).map(value => value.trim());
        return headers.reduce((obj: ProcessedData, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });

      return data;
    } catch (error) {
      throw new Error("Error processing PDF file. Make sure it contains table-like data.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError("");

    try {
      let processedData: ProcessedData[];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      switch (fileExtension) {
        case 'csv':
          processedData = await processCSV(file);
          break;
        case 'xlsx':
        case 'xls':
          processedData = await processExcel(file);
          break;
        case 'pdf':
          processedData = await processPDF(file);
          break;
        default:
          throw new Error("Unsupported file type");
      }

      if (processedData.length === 0) {
        throw new Error("No data found in file");
      }

      onDataProcessed(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Upload Data File (CSV, Excel, or PDF)</Label>
        <Input 
          id="file" 
          type="file" 
          accept=".csv,.xlsx,.xls,.pdf" 
          onChange={handleFileChange}
          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <p className="text-sm text-gray-500">
          Maximum file size: 75MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={!file || isProcessing}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : "Analyze Data"}
      </Button>
    </div>
  );
}
