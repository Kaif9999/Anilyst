/**
 * Centralized subscription and usage limit checks.
 * Use this in all API routes that require subscription enforcement.
 */

import { prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";

const FREE_LIMITS = {
  visualizations: 1,
  analyses: 4,
} as const;

export type SubscriptionCheckResult =
  | { allowed: true }
  | { allowed: false; status: number; error: string };

/**
 * Check if user can perform an analysis. Enforces subscription status and usage limits.
 */
export async function checkAnalysisAccess(userId: string): Promise<SubscriptionCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, subscriptionType: true },
  });

  if (!user) {
    return { allowed: false, status: 404, error: "User not found" };
  }

  if (user.subscriptionType === SubscriptionType.PRO || user.subscriptionType === SubscriptionType.LIFETIME) {
    return { allowed: true };
  }

  const usageLimit = await prisma.usageLimit.findUnique({
    where: { userId: user.id },
    select: {
      analyses: true,
      analysisLimit: true,
      lastResetDate: true,
      subscriptionStatus: true,
    },
  });

  if (usageLimit?.subscriptionStatus === "expired") {
    return {
      allowed: false,
      status: 402,
      error: "Your subscription has expired. Please renew to continue using the service.",
    };
  }

  if (!usageLimit) {
    await prisma.usageLimit.create({
      data: {
        userId: user.id,
        visualizations: 0,
        analyses: 0,
        visualizationLimit: FREE_LIMITS.visualizations,
        analysisLimit: FREE_LIMITS.analyses,
        lastResetDate: new Date(),
        subscriptionStatus: "active",
      },
    });
    return { allowed: false, status: 400, error: "Please try again" };
  }

  // Daily reset for free users
  const lastReset = new Date(usageLimit.lastResetDate);
  const now = new Date();
  const shouldReset =
    lastReset.getDate() !== now.getDate() || lastReset.getMonth() !== now.getMonth();

  if (shouldReset) {
    await prisma.usageLimit.update({
      where: { userId: user.id },
      data: { visualizations: 0, analyses: 0, lastResetDate: now },
    });
  }

  const currentAnalyses = shouldReset ? 0 : usageLimit.analyses;
  const limit = usageLimit.analysisLimit;

  if (currentAnalyses >= limit) {
    return {
      allowed: false,
      status: 429,
      error: "You've reached your daily analysis limit. Upgrade to PRO for unlimited analyses!",
    };
  }

  return { allowed: true };
}

/**
 * Increment analysis count after successful analysis. Call only when checkAnalysisAccess allowed.
 */
export async function incrementAnalysisCount(userId: string): Promise<void> {
  const existing = await prisma.usageLimit.findUnique({ where: { userId } });
  if (existing) {
    await prisma.usageLimit.update({
      where: { userId },
      data: { analyses: { increment: 1 } },
    });
  }
}
