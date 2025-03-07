import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's visualization history
    const visualizations = await prisma.analysis.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        content: true
      }
    });

    // Transform the data to include visualization details
    const sessions = visualizations.map(viz => ({
      id: viz.id,
      fileName: viz.fileName,
      fileType: viz.fileType,
      createdAt: viz.createdAt,
      visualizations: extractVisualizationsFromContent(viz.content)
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch visualization history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visualization history' },
      { status: 500 }
    );
  }
}

// Add POST endpoint for creating new sessions
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a new empty session
    const newSession = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileName: 'New Session',
        fileType: 'session',
        content: JSON.stringify({
          chartData: null,
          insights: {
            trends: [],
            anomalies: [],
            correlations: [],
            statistics: {
              mean: 0,
              median: 0,
              mode: 0,
              outliers: []
            }
          },
          recommendations: [],
          chatHistory: []
        })
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        fileName: newSession.fileName,
        fileType: newSession.fileType,
        createdAt: newSession.createdAt,
        visualizations: []
      }
    });
  } catch (error) {
    console.error('Failed to create new session:', error);
    return NextResponse.json(
      { error: 'Failed to create new session' },
      { status: 500 }
    );
  }
}

function extractVisualizationsFromContent(content: string) {
  try {
    // Extract visualization information from the analysis content
    // This is a simple example - adjust based on your actual content structure
    const visualizations = [];
    
    if (content.includes('chart') || content.includes('graph')) {
      visualizations.push({
        type: 'chart',
        title: 'Data Visualization'
      });
    }
    
    if (content.includes('trend')) {
      visualizations.push({
        type: 'trend',
        title: 'Trend Analysis'
      });
    }
    
    if (content.includes('correlation')) {
      visualizations.push({
        type: 'correlation',
        title: 'Correlation Analysis'
      });
    }

    return visualizations;
  } catch (error) {
    console.error('Error extracting visualizations:', error);
    return [];
  }
} 