import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    
    // Handle payment success event
    if (payload.type === "payment.success") {
      const userEmail = payload.data.customer.email;
      const productId = payload.data.product.id;
      
      // Determine subscription type based on product ID
      const subscriptionType = productId === "pdt_6iGXPJ0iAZjGLv0lINYR4" 
        ? "LIFETIME" 
        : "PRO";
      
      // Update user subscription
      const user = await prisma.user.update({
        where: { email: userEmail },
        data: {
          subscriptionType: subscriptionType
        }
      });

      // Reset usage limits
      await prisma.usageLimit.update({
        where: { userId: user.id },
        data: {
          visualizations: 0,
          analyses: 0,
          lastResetDate: new Date()
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
} 