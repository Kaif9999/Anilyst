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

    // Create a new empty session
    const newSession = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileName: body.fileName || "New Analysis",
        fileType: body.fileType || "visualization",
        content: JSON.stringify({
          chartData: body.chartData,
          analysisResult: body.analysisResult,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        fileName: newSession.fileName,
        fileType: newSession.fileType,
        createdAt: newSession.createdAt,
        chartData: body.chartData,
        analysisResult: body.analysisResult,
        visualizations: extractVisualizationsFromContent(newSession.content),
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
