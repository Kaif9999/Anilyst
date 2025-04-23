import { NextResponse } from "next/server";
import { AnalyticsResult } from "@/types/index";
import OpenAI from "openai";
import { 
  trimDataForTokenLimit, 
  ensurePromptFitsTokenLimit,
  TOKEN_LIMITS,
  Dataset
} from "@/app/utils/token-helpers";

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

    // Trim data and context to fit within token limits
    const trimmedData = trimDataForTokenLimit(data, TOKEN_LIMITS.MAX_DATA_TOKENS);
    const trimmedContext = trimDataForTokenLimit(initialContext, TOKEN_LIMITS.MAX_CONTEXT_TOKENS);
    
    let dataWasTrimmed = JSON.stringify(trimmedData) !== JSON.stringify(data);
    let contextWasTrimmed = JSON.stringify(trimmedContext) !== JSON.stringify(initialContext);
    
    // Construct prompt with trimmed data and context
    let prompt = `
      You are an AI data analyst. Analyze this data and answer the following question:
      
      Question: ${query}
      
      Chart Data:
      ${JSON.stringify(trimmedData, null, 2)}
      ${dataWasTrimmed ? "\n(Note: The data has been trimmed to fit within token limits)" : ""}
      
      Previous Analysis Context:
      ${JSON.stringify(trimmedContext, null, 2)}
      ${contextWasTrimmed ? "\n(Note: The context has been trimmed to fit within token limits)" : ""}
      
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
    
    // Check if the prompt is still too large and trim if necessary
    const promptResult = ensurePromptFitsTokenLimit(prompt, TOKEN_LIMITS.MAX_PROMPT_TOKENS);
    prompt = promptResult.prompt;
    
    // If prompt is still too large after trimming, return an error
    if (promptResult.tokenCount > TOKEN_LIMITS.MAX_TOTAL_TOKENS) {
      console.error(`Prompt too large (${promptResult.tokenCount} tokens) even after trimming`);
      return NextResponse.json(
        { 
          error: "Query too complex. Please simplify your request or reduce the data size.",
          tokenEstimate: promptResult.tokenCount,
          maxTokens: TOKEN_LIMITS.MAX_TOTAL_TOKENS
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

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
      ...initialContext, // Return the original context, not the trimmed one
      insights: {
        ...initialContext.insights,
        queryResponse: {
          question: query,
          answer: text,
          timestamp: new Date().toISOString(),
        },
      },
      _trimmedForProcessing: dataWasTrimmed || contextWasTrimmed || promptResult.wasTrimmed,
    });
  } catch (error) {
    console.error("Query analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze query" },
      { status: 500 }
    );
  }
}
