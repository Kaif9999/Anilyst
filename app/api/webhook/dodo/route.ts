import { NextResponse } from "next/server";
import { PrismaClient, SubscriptionType, Prisma } from "@prisma/client";
import { headers } from "next/headers";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Verify webhook signature
function verifySignature(payload: string, signature: string, timestamp: string) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET!;
  
  // Create the signature message (timestamp + payload)
  const signatureMessage = timestamp + payload;
  
  // Create HMAC using webhook secret
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(signatureMessage);
  const expectedSignature = hmac.digest('hex');
  
  // Compare signatures using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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
  const userEmail = payload.data.customer.email;
  const productId = payload.data.product.id;
  const subscriptionId = payload.data.subscription?.id;
  const nextBillingDate = payload.data.subscription?.next_billing_date 
    ? new Date(payload.data.subscription.next_billing_date)
    : undefined;
  
  const subscriptionType = productId === "pdt_6iGXPJ0iAZjGLv0lINYR4" 
    ? SubscriptionType.LIFETIME 
    : SubscriptionType.PRO;
  
  const user = await prisma.user.update({
    where: { email: userEmail },
    data: {
      subscriptionType,
      subscriptionId: subscriptionId || null
    }
  });

  const usageLimitData: Prisma.UsageLimitCreateInput = {
    user: { connect: { id: user.id } },
    visualizations: 0,
    analyses: 0,
    visualizationLimit: subscriptionLimits[subscriptionType].visualizationLimit,
    analysisLimit: subscriptionLimits[subscriptionType].analysisLimit,
    lastResetDate: new Date(),
    nextBillingDate,
    subscriptionStatus: 'active'
  };

  await prisma.usageLimit.upsert({
    where: { userId: user.id },
    update: {
      visualizations: 0,
      analyses: 0,
      visualizationLimit: subscriptionLimits[subscriptionType].visualizationLimit,
      analysisLimit: subscriptionLimits[subscriptionType].analysisLimit,
      nextBillingDate,
      subscriptionStatus: 'active'
    },
    create: usageLimitData
  });

  return NextResponse.json({ success: true });
}

async function handleSubscriptionCancelled(payload: any) {
  const subscriptionId = payload.data.subscription.id;
  
  const user = await prisma.user.findFirst({
    where: {
      subscriptionId: subscriptionId
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.usageLimit.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: 'cancelled'
    }
  });

  return NextResponse.json({ success: true });
}

async function handleSubscriptionExpired(payload: any) {
  const subscriptionId = payload.data.subscription.id;
  
  const user = await prisma.user.findFirst({
    where: {
      subscriptionId: subscriptionId
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionType: SubscriptionType.FREE,
      subscriptionId: null
    }
  });

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
} 