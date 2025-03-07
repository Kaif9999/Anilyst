import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dodoPayments } from "@/lib/dodoPayments";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, billingCycle, customerEmail, redirectUrl } = await req.json();

    // Create payment link
    const paymentLink = await dodoPayments.createPaymentLink({
      productId,
      customerEmail: customerEmail || session.user.email,
      billingCycle,
      redirectUrl,
    });

    return NextResponse.json(paymentLink);
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
} 