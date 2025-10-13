import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { firstMessage, response, hasData, filename } = body;

    // Call FastAPI to generate title
    const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    
    try {
      const fastApiResponse = await fetch(`${FASTAPI_URL}/api/generate-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_message: firstMessage,
          response: response,
          has_data: hasData,
          filename: filename,
        }),
      });

      if (!fastApiResponse.ok) {
        throw new Error('Failed to generate title from AI');
      }

      const { title } = await fastApiResponse.json();

      // Update session with generated title
      const updatedSession = await prisma.chatSession.update({
        where: {
          id: params.id,
          userId: user.id,
        },
        data: {
          title,
          autoTitleGenerated: true,
        },
      });

      return NextResponse.json({ session: updatedSession, title });
    } catch (error) {
      console.error('Error calling FastAPI for title generation:', error);
      
      // Fallback title
      const fallbackTitle = hasData && filename 
        ? `Analysis: ${filename.substring(0, 20)}`
        : 'Data Analysis Chat';
      
      const updatedSession = await prisma.chatSession.update({
        where: { id: params.id, userId: user.id },
        data: { title: fallbackTitle, autoTitleGenerated: true },
      });

      return NextResponse.json({ session: updatedSession, title: fallbackTitle });
    }
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}