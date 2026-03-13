import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkAnalysisAccess } from "@/lib/subscription-check";

// Default response structure
const defaultAnalysis = {
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
    question: "",
    answer: "",
    timestamp: new Date().toISOString(),
  },
};

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Centralized subscription check
    const access = await checkAnalysisAccess(session.user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error, ...defaultAnalysis },
        { status: access.status }
      );
    }

    // AI-powered analysis is intentionally disabled in this deployment.
    return NextResponse.json(
      {
        error:
          "AI-powered analysis is disabled in this deployment. Please enable an AI backend to use this feature.",
        ...defaultAnalysis,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { 
        error: "Error processing request",
        ...defaultAnalysis
      },
      { status: 500 }
    );
  }
} 