import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { AnalyticsResult } from "@/types/index";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { query, data, context } = await req.json();

    // Initialize Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create initial context if none exists
    const initialContext: AnalyticsResult = context || {
      chartData: data,
      insights: {
        trends: [],
        anomalies: [],
        correlations: [],
        statistics: {
          mean: 0,
          median: 0,
          mode: 0,
          outliers: [],
        },
        queryResponse: {
          question: query,
          answer: "",
          timestamp: new Date().toISOString(),
        },
      },
      recommendations: [],
    };

    // Construct prompt with context
    const prompt = `
      You are an AI data analyst. Analyze this data and answer the following question:
      
      Question: ${query}
      
      Chart Data:
      ${JSON.stringify(data, null, 2)}
      
      Previous Analysis Context:
      ${JSON.stringify(initialContext, null, 2)}
      
      Please format your response with the following structure:
      **1. Direct Answer:**
      Provide a clear, direct answer to the question.

      **2. Key Insights:**
      List key insights related to the question.

      **3. Relevant Trends or Patterns:**
      Describe any relevant trends or patterns in the data.

      **4. Statistical Significance:**
      Explain the statistical significance of the findings.
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Structure the response
    return NextResponse.json({
      ...initialContext,
      insights: {
        ...initialContext.insights,
        queryResponse: {
          question: query,
          answer: text,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Query analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze query" },
      { status: 500 }
    );
  }
}
