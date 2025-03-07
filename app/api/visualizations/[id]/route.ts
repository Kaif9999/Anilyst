import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the visualization session
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user can only access their own data
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Visualization session not found' },
        { status: 404 }
      );
    }

    // Parse the content
    try {
      const content = JSON.parse(analysis.content);
      
      // Return structured data
      return NextResponse.json({
        chartData: content.chartData || null,
        analysisResult: {
          insights: {
            trends: content.insights?.trends || [],
            anomalies: content.insights?.anomalies || [],
            correlations: content.insights?.correlations || [],
            statistics: content.insights?.statistics || {
              mean: 0,
              median: 0,
              mode: 0,
              outliers: []
            },
            queryResponse: content.insights?.queryResponse || {
              question: "",
              answer: "",
              timestamp: new Date().toISOString()
            }
          },
          recommendations: content.recommendations || [],
          chatHistory: content.chatHistory || []
        },
        chatHistory: content.chatHistory || []
      });
    } catch (error) {
      console.error('Error parsing visualization content:', error);
      // Return empty state if parsing fails
      return NextResponse.json({
        chartData: null,
        analysisResult: {
          insights: {
            trends: [],
            anomalies: [],
            correlations: [],
            statistics: {
              mean: 0,
              median: 0,
              mode: 0,
              outliers: []
            },
            queryResponse: {
              question: "",
              answer: "",
              timestamp: new Date().toISOString()
            }
          },
          recommendations: [],
          chatHistory: []
        },
        chatHistory: []
      });
    }
  } catch (error) {
    console.error('Failed to fetch visualization session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visualization session' },
      { status: 500 }
    );
  }
} 