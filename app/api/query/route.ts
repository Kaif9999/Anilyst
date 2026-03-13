import { NextResponse } from "next/server";
import type { AnalyticsResult } from "@/types/index";
import { validateQuery } from "@/lib/api-schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const queryValidation = validateQuery(body);

    if ("error" in queryValidation) {
      return NextResponse.json(
        { error: queryValidation.error },
        { status: queryValidation.status }
      );
    }

    const { query } = queryValidation;
    const { data, context } = body;

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

    return NextResponse.json({
      ...initialContext,
      insights: {
        ...initialContext.insights,
        queryResponse: {
          question: query,
          answer:
            "AI-powered query analysis is disabled in this deployment. Please enable it or connect to a supported AI backend to see automated insights.",
          timestamp: new Date().toISOString(),
        },
      },
      _aiDisabled: true,
    });
  } catch (error) {
    console.error("Query analysis failed:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze query (AI features are disabled).",
      },
      { status: 500 }
    );
  }
}
