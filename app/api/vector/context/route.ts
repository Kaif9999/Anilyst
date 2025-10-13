import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, session_id } = await req.json();

    // Call backend vector service
    const response = await fetch(`${process.env.FASTAPI_URL}/vector/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        user_id: session.user.id,
        session_id
      })
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        context: data.has_context ? data : null,
        has_context: data.has_context || false,
        similar_analyses_count: data.similar_analyses?.length || 0,
        suggested_sources: data.suggested_data_sources || []
      });
    }

    return NextResponse.json({
      context: null,
      has_context: false,
      similar_analyses_count: 0,
      suggested_sources: []
    });

  } catch (error) {
    console.error('Error fetching vector context:', error);
    return NextResponse.json({
      context: null,
      has_context: false,
      similar_analyses_count: 0,
      suggested_sources: []
    });
  }
}

export async function PUT(req: NextRequest) {
  // Placeholder for future vector context updates
  return NextResponse.json({ message: 'Vector context update endpoint' });
}