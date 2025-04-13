import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's visualization history
    const visualizations = await prisma.analysis.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        content: true,
      },
    });

    // Transform the data to include visualization details
    const sessions = visualizations.map((viz) => {
      const content = JSON.parse(viz.content);
      return {
        id: viz.id,
        fileName: viz.fileName,
        fileType: viz.fileType,
        createdAt: viz.createdAt,
        chartData: content.chartData,
        analysisResult: content.analysisResult,
        visualizations: extractVisualizationsFromContent(viz.content),
      };
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to fetch visualization history:", error);
    return NextResponse.json(
      { error: "Failed to fetch visualization history" },
      { status: 500 },
    );
  }
}

// Add POST endpoint for creating new sessions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    
    console.log("History endpoint received request with keys:", Object.keys(body));
    
    // Validate required fields
    if (!body.chartData) {
      console.error("Missing chartData in request");
      return NextResponse.json(
        { error: "Missing chartData in request" },
        { status: 400 }
      );
    }

    // Safely serialize the data to prevent circular references
    let safeContent;
    try {
      // Only include necessary fields to avoid circular references
      const serializedContent = {
        chartData: body.chartData,
        analysisResult: body.analysisResult ? {
          insights: body.analysisResult.insights || {},
          recommendations: body.analysisResult.recommendations || [],
        } : {},
        timestamp: new Date().toISOString(),
      };
      
      // Verify we can stringify it without errors
      safeContent = JSON.stringify(serializedContent);
      console.log("Successfully serialized content of length:", safeContent.length);
    } catch (serializeError) {
      console.error("Error serializing visualization content:", serializeError);
      // Fallback to a simpler structure
      safeContent = JSON.stringify({
        chartData: body.chartData,
        timestamp: new Date().toISOString(),
        error: "Failed to serialize full content"
      });
    }

    // Create a new session
    const newSession = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileName: body.fileName || "New Analysis",
        fileType: body.fileType || "visualization",
        content: safeContent,
      },
    });

    console.log("Created new history session with ID:", newSession.id);

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        fileName: newSession.fileName,
        fileType: newSession.fileType,
        createdAt: newSession.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create new session:", error);
    return NextResponse.json(
      { error: "Failed to create new session" },
      { status: 500 }
    );
  }
}

function extractVisualizationsFromContent(content: string) {
  try {
    const parsedContent = JSON.parse(content);
    const visualizations = [];

    if (parsedContent.chartData) {
      visualizations.push({
        type: "chart",
        title: "Data Visualization",
      });
    }

    if (parsedContent.analysisResult?.insights?.trends) {
      visualizations.push({
        type: "trend",
        title: "Trend Analysis",
      });
    }

    if (parsedContent.analysisResult?.insights?.correlations) {
      visualizations.push({
        type: "correlation",
        title: "Correlation Analysis",
      });
    }

    return visualizations;
  } catch (error) {
    console.error("Error extracting visualizations:", error);
    return [];
  }
}
