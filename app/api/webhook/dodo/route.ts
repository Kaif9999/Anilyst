import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Verify webhook signature (you should implement this based on Dodo Payments documentation)
    // const signature = req.headers.get("dodo-signature");
    
    // Handle payment success event
    if (payload.type === "payment.success") {
      const userEmail = payload.data.customer.email;
      
      // Update user subscription
      const user = await prisma.user.update({
        where: { email: userEmail },
        data: {
          subscriptionType: "PRO"
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