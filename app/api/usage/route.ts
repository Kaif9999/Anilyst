import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const DAILY_LIMITS = {
  FREE: {
    visualizations: 5,
    analyses: 5
  }
};

async function resetDailyLimitsIfNeeded(usageLimit: any) {
  const lastReset = new Date(usageLimit.lastResetDate);
  const now = new Date();
  
  if (lastReset.getDate() !== now.getDate() || 
      lastReset.getMonth() !== now.getMonth() || 
      lastReset.getFullYear() !== now.getFullYear()) {
    await prisma.usageLimit.update({
      where: { id: usageLimit.id },
      data: {
        visualizations: 0,
        analyses: 0,
        lastResetDate: now
      }
    });
    return true;
  }
  return false;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
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

  await resetDailyLimitsIfNeeded(user.usageLimit);

  return new NextResponse(JSON.stringify({
    subscriptionType: user.subscriptionType,
    usage: user.usageLimit,
    limits: user.subscriptionType === 'FREE' ? DAILY_LIMITS.FREE : null
  }));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
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

  // Reset daily limits if needed
  const wasReset = await resetDailyLimitsIfNeeded(user.usageLimit);
  
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
    ? DAILY_LIMITS.FREE.visualizations 
    : DAILY_LIMITS.FREE.analyses;

  if (currentCount >= limit) {
    return new NextResponse(JSON.stringify({
      error: type === "visualization"
        ? "Wow! You've created 5 amazing visualizations today. Ready to unlock unlimited creativity with Pro?"
        : "You've explored 5 powerful analyses today. Upgrade to Pro for unlimited AI insights!"
      redirectTo: '/pricing',
      usage: user.usageLimit,
      limits: DAILY_LIMITS.FREE
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
    limits: DAILY_LIMITS.FREE
  }));
}
