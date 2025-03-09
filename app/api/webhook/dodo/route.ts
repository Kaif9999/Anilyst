import { NextResponse } from "next/server";
import { PrismaClient, SubscriptionType, Prisma } from "@prisma/client";
import { headers } from "next/headers";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Verify webhook signature
function verifySignature(payload: string, signature: string, timestamp: string) {
  try {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET!;
    
    // Extract signature version and value
    const [version, receivedSignature] = signature.split(',');
    if (version !== 'v1') {
      console.error('Invalid signature version');
      return false;
    }

    // Create the signature message (timestamp + payload)
    const signatureMessage = timestamp + payload;
    
    // Create HMAC using webhook secret
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(signatureMessage);
    const expectedSignature = hmac.digest('base64');

    // Log for debugging
    console.log('Expected Signature:', expectedSignature);
    console.log('Received Signature:', receivedSignature);
    console.log('Timestamp:', timestamp);
    console.log('Payload Length:', payload.length);

    return expectedSignature === receivedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Define subscription limits
const subscriptionLimits = {
  FREE: {
    visualizationLimit: 1,
    analysisLimit: 4
  },
  PRO: {
    visualizationLimit: 999999, // Unlimited
    analysisLimit: 999999 // Unlimited
  },
  LIFETIME: {
    visualizationLimit: 999999, // Unlimited
    analysisLimit: 999999 // Unlimited
  }
};

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const rawBody = await req.text();
    
    // Get webhook headers
    const signature = headersList.get("webhook-signature") || "";
    const timestamp = headersList.get("webhook-timestamp") || "";
    
    // Verify webhook signature
    if (!verifySignature(rawBody, signature, timestamp)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    
    switch (eventType) {
      case "payment.success":
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
    const productId = payload.data.product.id;
    const subscriptionId = payload.data.subscription?.id;
    const nextBillingDate = payload.data.subscription?.next_billing_date 
      ? new Date(payload.data.subscription.next_billing_date)
      : undefined;
    
    // Determine subscription type based on product ID
    const subscriptionType = productId === "pdt_6iGXPJ0iAZjGLv0lINYR4" 
      ? SubscriptionType.LIFETIME 
      : SubscriptionType.PRO;

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
        subscriptionId: subscriptionId || null
      }
    });

    // Reset usage limits for the new subscription
    const usageLimitData = {
      visualizations: 0,
      analyses: 0,
      visualizationLimit: 999999,
      analysisLimit: 999999,
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
    
    // Determine subscription type based on product ID
    const subscriptionType = productId === "pdt_6iGXPJ0iAZjGLv0lINYR4" 
      ? SubscriptionType.LIFETIME 
      : SubscriptionType.PRO;

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
      visualizationLimit: 999999,
      analysisLimit: 999999,
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
    const subscriptionId = payload.data.subscription.id;
    
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
    const subscriptionId = payload.data.subscription.id;
    
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
        visualizationLimit: subscriptionLimits.FREE.visualizationLimit,
        analysisLimit: subscriptionLimits.FREE.analysisLimit,
        subscriptionStatus: 'expired',
        nextBillingDate: null
      }
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