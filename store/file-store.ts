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

export interface PostgresConnection {
  connectionString: string;
  sessionId: string;
  database?: string;
  version?: string;
  tableCount?: number;
  connected: boolean;
  connectedAt?: Date;
}

interface FileStore {
  currentFile: FileMetadata | null;
  rawData: (StockData | SimpleData)[];
  chartData: ChartData | null;
  aiAnalysis: string;
  availableYears: string[];
  selectedYear: string;
  
  // PostgreSQL connection
  postgresConnection: PostgresConnection | null;
  
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
  setPostgresConnection: (connection: PostgresConnection | null) => void;
  clearData: () => void;
  
  // Computed getters
  getProcessedData: () => ChartData | null;
  isStockData: () => boolean;
  hasData: () => boolean;
  hasPostgresConnection: () => boolean;
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
      postgresConnection: null,
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
      setPostgresConnection: (connection) => set({ postgresConnection: connection }),
      
      clearData: () => set({
        currentFile: null,
        rawData: [],
        chartData: null,
        availableYears: [],
        selectedYear: 'all',
        postgresConnection: null,
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
      
      hasPostgresConnection: () => {
        const state = get();
        return !!state.postgresConnection && state.postgresConnection.connected;
      },
    }),
    {
      name: 'file-store',
      // ✅ DON'T persist CSV data - only UI preferences
      partialize: (state) => ({
        // ❌ Removed: currentFile, rawData, chartData, aiAnalysis
        // These should be per-session in component state
        
        // ✅ Only persist user preferences
        selectedYear: state.selectedYear,
        availableYears: state.availableYears,
      }),
    }
  )
);