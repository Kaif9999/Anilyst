import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        usageLimit: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionType: user.subscriptionType,
      subscriptionId: user.subscriptionId,
      usageLimit: user.usageLimit,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}

// Endpoint to reset usage limits
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        usageLimit: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Reset usage limits based on subscription type
    const usageLimitData = {
      visualizations: 0,
      analyses: 0,
      visualizationLimit: user.subscriptionType === 'FREE' ? 1 : 999999,
      analysisLimit: user.subscriptionType === 'FREE' ? 4 : 999999,
      lastResetDate: new Date(),
      subscriptionStatus: 'active'
    };

    // Update usage limits
    if (user.usageLimit) {
      await prisma.usageLimit.update({
        where: { userId: user.id },
        data: usageLimitData
      });
    } else {
      await prisma.usageLimit.create({
        data: {
          ...usageLimitData,
          user: { connect: { id: user.id } }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usage limits reset successfully",
      usageLimit: usageLimitData
    });
  } catch (error) {
    console.error("Error resetting usage limits:", error);
    return NextResponse.json(
      { error: "Failed to reset usage limits" },
      { status: 500 }
    );
  }
} 