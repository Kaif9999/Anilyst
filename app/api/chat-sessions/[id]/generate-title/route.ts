import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await req.json();
    const { firstMessage, response, hasData, filename } = body;

    // Verify session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Call FastAPI to generate title
    const titleResponse = await fetch(`${FASTAPI_URL}/generate-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_message: firstMessage,
        response: response,
        has_data: hasData || false,
        filename: filename || null
      })
    });

    if (!titleResponse.ok) {
      throw new Error('Failed to generate title');
    }

    const { title } = await titleResponse.json();

    // Update session with generated title
    await prisma.chatSession.update({
      where: { id: id },
      data: {
        title: title,
        autoTitleGenerated: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ title, success: true });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}