import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ✅ GET endpoint to load messages
export async function GET(
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

    // ✅ Await params before accessing properties
    const { id } = await params;

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

    // Load all messages for this session
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        timestamp: 'asc', // ✅ Changed from 'createdAt' to 'timestamp'
      },
    });

    console.log(`✅ Loaded ${messages.length} messages for session ${id}`);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error loading messages:', error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { role, content, vectorContextUsed, analysisType, metadata } = body;

    // ✅ Await params before accessing properties
    const { id } = await params;

    console.log('💾 POST /messages called:', {
      sessionId: id,
      role,
      contentLength: content?.length,
      vectorContextUsed,
      analysisType,
      hasMetadata: !!metadata
    });

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

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role,
        content,
        vectorContextUsed: vectorContextUsed || false,
        analysisType,
        metadata,
        timestamp: new Date(),
      },
    });

    console.log('✅ Message created:', message.id);

    // Update session
    await prisma.chatSession.update({
      where: { id: id },
      data: {
        messageCount: { increment: 1 },
        lastMessage: content.substring(0, 200),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Session updated with new message count');

    return NextResponse.json({ 
      message,
      success: true 
    });
  } catch (error) {
    console.error('❌ Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}