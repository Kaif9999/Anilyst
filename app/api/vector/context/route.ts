import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL;
    
    if (!FASTAPI_URL) {
      console.error('❌ FASTAPI_URL not configured');
      return NextResponse.json(
        { 
          context: {
            similar_analyses: [],
            suggested_data_sources: [],
            suggested_analysis_types: [],
            has_context: false
          }
        },
        { status: 200 }
      );
    }

    console.log('🔍 Fetching vector context from:', `${FASTAPI_URL}/api/vector/context`);

    // Call FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/api/vector/context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        session_id: body.session_id,
        user_id: body.user_id,
        top_k: body.top_k || 3,
      }),
    });

    if (!response.ok) {
      console.error('❌ FastAPI vector context error:', response.status);
      return NextResponse.json(
        { 
          context: {
            similar_analyses: [],
            suggested_data_sources: [],
            suggested_analysis_types: [],
            has_context: false
          }
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('✅ Vector context fetched successfully');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching vector context:', error);
    
    // Return empty context instead of error to not break the UI
    return NextResponse.json(
      { 
        context: {
          similar_analyses: [],
          suggested_data_sources: [],
          suggested_analysis_types: [],
          has_context: false
        }
      },
      { status: 200 }
    );
  }
}

export async function PUT(req: NextRequest) {
  // Placeholder for future vector context updates
  return NextResponse.json({ message: 'Vector context update endpoint' });
}