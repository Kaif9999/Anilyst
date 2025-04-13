import { NextResponse } from "next/server";
import { AnalyticsResult } from "@/types/index";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query, data, context } = await req.json();

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

    // Get response from OpenAI using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a skilled data analyst assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    // Extract the response text
    const text = completion.choices[0].message.content || "No analysis available";

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
