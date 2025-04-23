import { ChartData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export const analysisApi = {
  /**
   * Check if the FastAPI backend is running
   */
  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to connect to FastAPI backend:', error);
      throw error;
    }
  },

  /**
   * Analyze chart data
   */
  async analyze(data: ChartData) {
    try {
      console.log('Calling analyze endpoint');
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          fileName: "Analysis_" + new Date().toISOString(),
          fileType: "application/json",
        }),
      });

      if (!response.ok) {
        console.error('Analysis response not OK:', response.status, response.statusText);
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis API call failed:', error);
      throw error;
    }
  },

  /**
   * Get AI insights for chart data
   */
  async getAiInsights(data: ChartData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`AI insights failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI insights API call failed:', error);
      throw error;
    }
  },

  /**
   * Get predictions for chart data
   */
  async getPredictions(data: ChartData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Prediction API call failed:', error);
      throw error;
    }
  },

  /**
   * Get statistical analysis for chart data
   */
  async getStatisticalAnalysis(data: ChartData) {
    try {
      console.log('Calling statistical-analysis endpoint:', `${API_BASE_URL}/statistical-analysis`);
      
      const response = await fetch(`${API_BASE_URL}/statistical-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Statistical analysis response not OK:', response.status, response.statusText);
        throw new Error(`Statistical analysis failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Statistical analysis API call failed:', error);
      throw error;
    }
  }
};
