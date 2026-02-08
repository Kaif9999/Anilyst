import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dodoPayments } from "@/lib/dodoPayments";
import { validateCreatePaymentLink } from "@/lib/api-schemas";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = validateCreatePaymentLink(body);
    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const { productId, billingCycle, customerEmail, redirectUrl } = validation;

    const paymentLink = await dodoPayments.createPaymentLink({
      productId,
      customerEmail: customerEmail ?? session.user.email ?? undefined,
      billingCycle,
      redirectUrl: redirectUrl || process.env.NEXT_PUBLIC_APP_URL || "https://anilyst.tech",
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