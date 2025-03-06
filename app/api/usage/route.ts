import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const FREE_LIMITS = {
  visualizations: 5,
  analyses: 5
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { usageLimit: true }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  if (!user.usageLimit) {
    const usageLimit = await prisma.usageLimit.create({
      data: {
        userId: user.id,
        visualizations: 0,
        analyses: 0
      }
    });
    user.usageLimit = usageLimit;
  }

  return new NextResponse(JSON.stringify({
    subscriptionType: user.subscriptionType,
    usage: user.usageLimit,
    limits: user.subscriptionType === 'FREE' ? FREE_LIMITS : null
  }));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { type } = await req.json();
  
  if (!type || (type !== 'visualization' && type !== 'analysis')) {
    return new NextResponse(JSON.stringify({ error: 'Invalid usage type' }), { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { usageLimit: true }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  // Create usage limit if it doesn't exist
  if (!user.usageLimit) {
    user.usageLimit = await prisma.usageLimit.create({
      data: {
        userId: user.id,
        visualizations: 0,
        analyses: 0
      }
    });
  }
  
  // If user is PRO or LIFETIME, allow unlimited usage
  if (user.subscriptionType === 'PRO' || user.subscriptionType === 'LIFETIME') {
    const updateData = type === 'visualization' 
      ? { visualizations: user.usageLimit.visualizations + 1 }
      : { analyses: user.usageLimit.analyses + 1 };
      
    const updatedUsage = await prisma.usageLimit.update({
      where: { id: user.usageLimit.id },
      data: updateData
    });

    return new NextResponse(JSON.stringify({
      success: true,
      usage: updatedUsage,
      limits: null
    }));
  }

  // For FREE users, check limits
  const currentCount = type === 'visualization' 
    ? user.usageLimit.visualizations 
    : user.usageLimit.analyses;
  const limit = type === 'visualization' 
    ? FREE_LIMITS.visualizations 
    : FREE_LIMITS.analyses;

  if (currentCount >= limit) {
    return new NextResponse(JSON.stringify({
      error: `You've reached your total ${type} limit. Please upgrade to Pro for unlimited access.`,
      redirectTo: '/pricing',
      usage: user.usageLimit,
      limits: FREE_LIMITS
    }), { status: 403 });
  }

  // Update usage
  const updateData = type === 'visualization'
    ? { visualizations: user.usageLimit.visualizations + 1 }
    : { analyses: user.usageLimit.analyses + 1 };

  const updatedUsage = await prisma.usageLimit.update({
    where: { id: user.usageLimit.id },
    data: updateData
  });

  return new NextResponse(JSON.stringify({
    success: true,
    usage: updatedUsage,
    limits: FREE_LIMITS
  }));
}
