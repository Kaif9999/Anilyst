import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume?: number;
}

export interface SimpleData {
  [key: string]: string | number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string | string[];
  }>;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  isStockData: boolean;
  rowCount: number;
}

interface FileStore {
  // File data
  currentFile: FileMetadata | null;
  rawData: (StockData | SimpleData)[];
  chartData: ChartData | null;
  
  // Analysis data
  aiAnalysis: string;
  availableYears: string[];
  selectedYear: string;
  
  // UI state
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string;
  isUploadModalOpen: boolean;
  
  // Actions
  setCurrentFile: (file: FileMetadata) => void;
  setRawData: (data: (StockData | SimpleData)[]) => void;
  setChartData: (data: ChartData) => void;
  setAiAnalysis: (analysis: string) => void;
  setAvailableYears: (years: string[]) => void;
  setSelectedYear: (year: string) => void;
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string) => void;
  setUploadModalOpen: (open: boolean) => void;
  clearData: () => void;
  
  // Computed getters
  getProcessedData: () => ChartData | null;
  isStockData: () => boolean;
  hasData: () => boolean;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentFile: null,
      rawData: [],
      chartData: null,
      aiAnalysis: '',
      availableYears: [],
      selectedYear: 'all',
      isLoading: false,
      isAnalyzing: false,
      error: '',
      isUploadModalOpen: false,
      
      // Actions
      setCurrentFile: (file) => set({ currentFile: file }),
      setRawData: (data) => set({ rawData: data }),
      setChartData: (data) => set({ chartData: data }),
      setAiAnalysis: (analysis) => set({ aiAnalysis: analysis }),
      setAvailableYears: (years) => set({ availableYears: years }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setError: (error) => set({ error }),
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      
      clearData: () => set({
        currentFile: null,
        rawData: [],
        chartData: null,
        aiAnalysis: '',
        availableYears: [],
        selectedYear: 'all',
        error: '',
      }),
      
      // Computed getters
      getProcessedData: () => {
        const state = get();
        return state.chartData;
      },
      
      isStockData: () => {
        const state = get();
        return state.currentFile?.isStockData || false;
      },
      
      hasData: () => {
        const state = get();
        return !!state.currentFile && state.rawData.length > 0;
      },
    }),
    {
      name: 'file-store',
      // Only persist essential data, not UI state
      partialize: (state) => ({
        currentFile: state.currentFile,
        rawData: state.rawData,
        chartData: state.chartData,
        aiAnalysis: state.aiAnalysis,
        availableYears: state.availableYears,
        selectedYear: state.selectedYear,
      }),
    }
  )
);