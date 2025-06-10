import { useFileStore } from '@/store/file-store';

export const useFileData = () => {
  const store = useFileStore();
  
  return {
    // File metadata
    currentFile: store.currentFile,
    hasData: store.hasData(),
    
    // Raw data
    rawData: store.rawData,
    chartData: store.chartData,
    
    // Analysis
    aiAnalysis: store.aiAnalysis,
    
    // Filtering
    availableYears: store.availableYears,
    selectedYear: store.selectedYear,
    setSelectedYear: store.setSelectedYear,
    
    // Computed data
    isStockData: store.isStockData(),
    processedData: store.getProcessedData(),
    
    // UI state
    isLoading: store.isLoading,
    isAnalyzing: store.isAnalyzing,
    error: store.error,
    
    // Actions
    clearData: store.clearData,
  };
};