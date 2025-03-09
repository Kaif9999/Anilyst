import { NextResponse } from "next/server";
import { PrismaClient, SubscriptionType } from "@prisma/client";
import { headers } from "next/headers";
import { Webhook } from "standardwebhooks";

const prisma = new PrismaClient();
const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!);

// Define subscription limits and product IDs
const LIFETIME_PRODUCT_ID = "pdt_6iGXPJ0iAZjGLv0lINYR4";

const subscriptionLimits = {
  FREE: {
    visualizationLimit: 1,
    analysisLimit: 4
  },
  PRO: {
    visualizationLimit: 999999,
    analysisLimit: 999999
  },
  LIFETIME: {
    visualizationLimit: 999999,
    analysisLimit: 999999
  }
};

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const rawBody = await req.text();

    // Get webhook headers according to Dodo's specification
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };

    // Verify the webhook using standardwebhooks
    await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody);
    
    console.log("Webhook received:", {
      type: payload.type,
      customer: payload.data?.customer?.email,
      subscription: payload.data?.subscription_id,
    });

    switch (payload.type) {
      case "payment.succeeded":
        return handlePaymentSuccess(payload);
      case "subscription.active":
        return handleSubscriptionActive(payload);
      case "subscription.cancelled":
        return handleSubscriptionCancelled(payload);
      case "subscription.expired":
        return handleSubscriptionExpired(payload);
      default:
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: any) {
  try {
    const userEmail = payload.data.customer.email;
    const productId = payload.data.product_id;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { usageLimit: true }
    });

    if (!user) {
      console.error(`User not found for email: ${userEmail}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If this is a lifetime subscription payment
    if (productId === LIFETIME_PRODUCT_ID) {
      // Update user subscription immediately for lifetime purchase
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionType: SubscriptionType.LIFETIME,
          subscriptionId: payload.data.payment_id // Use payment_id as subscription_id for lifetime
        }
      });

      // Update usage limits for lifetime subscription
      const usageLimitData = {
        visualizations: 0,
        analyses: 0,
        visualizationLimit: subscriptionLimits.LIFETIME.visualizationLimit,
        analysisLimit: subscriptionLimits.LIFETIME.analysisLimit,
        lastResetDate: new Date(),
        subscriptionStatus: 'active',
        nextBillingDate: null // No billing date for lifetime
      };

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
    }

    // Log the successful payment
    console.log("Payment success for user:", {
      email: userEmail,
      productId: productId,
      userId: user.id,
      isLifetime: productId === LIFETIME_PRODUCT_ID
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling payment success:", error);
    return NextResponse.json(
      { error: "Failed to process payment success" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActive(payload: any) {
  try {
    const userEmail = payload.data.customer.email;
    const productId = payload.data.product_id;
    const subscriptionId = payload.data.subscription_id;
    const nextBillingDate = payload.data.next_billing_date 
      ? new Date(payload.data.next_billing_date)
      : undefined;
    
    console.log("Processing subscription activation:", {
      email: userEmail,
      productId,
      subscriptionId,
      nextBillingDate,
      isLifetime: productId === LIFETIME_PRODUCT_ID
    });

    // Skip processing for lifetime subscriptions as they're handled in payment success
    if (productId === LIFETIME_PRODUCT_ID) {
      return NextResponse.json({ success: true });
    }

    // For PRO subscriptions, continue with normal flow
    const subscriptionType = SubscriptionType.PRO;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { usageLimit: true }
    });

    if (!user) {
      console.error(`User not found for email: ${userEmail}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionType,
        subscriptionId
      }
    });

    // Reset usage limits for the new subscription
    const usageLimitData = {
      visualizations: 0,
      analyses: 0,
      visualizationLimit: subscriptionLimits[subscriptionType].visualizationLimit,
      analysisLimit: subscriptionLimits[subscriptionType].analysisLimit,
      lastResetDate: new Date(),
      nextBillingDate,
      subscriptionStatus: 'active'
    };

    // Update or create usage limits
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

    console.log("Successfully activated subscription for user:", {
      email: userEmail,
      subscriptionType,
      subscriptionId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling subscription active:", error);
    return NextResponse.json(
      { error: "Failed to process subscription active" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCancelled(payload: any) {
  try {
    const subscriptionId = payload.data.subscription_id;
    
    console.log("Processing subscription cancellation:", { subscriptionId });

    const user = await prisma.user.findFirst({
      where: { subscriptionId }
    });

    if (!user) {
      console.error(`User not found for subscription: ${subscriptionId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update usage limit status
    await prisma.usageLimit.update({
      where: { userId: user.id },
      data: {
        subscriptionStatus: 'cancelled',
        nextBillingDate: null
      }
    });

    console.log("Successfully cancelled subscription for user:", {
      userId: user.id,
      subscriptionId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    return NextResponse.json(
      { error: "Failed to process subscription cancellation" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionExpired(payload: any) {
  try {
    const subscriptionId = payload.data.subscription_id;
    
    console.log("Processing subscription expiration:", { subscriptionId });

    const user = await prisma.user.findFirst({
      where: { subscriptionId }
    });

    if (!user) {
      console.error(`User not found for subscription: ${subscriptionId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user to free plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionType: SubscriptionType.FREE,
        subscriptionId: null
      }
    });

    // Update usage limits
    await prisma.usageLimit.update({
      where: { userId: user.id },
      data: {
        visualizationLimit: 1,
        analysisLimit: 4,
        subscriptionStatus: 'expired',
        nextBillingDate: null
      }
    });

    console.log("Successfully expired subscription for user:", {
      userId: user.id,
      subscriptionId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling subscription expiration:", error);
    return NextResponse.json(
      { error: "Failed to process subscription expiration" },
      { status: 500 }
    );
  }
} 