import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getDb, subscriptions, eq } from "@geokit/db";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  tier: z.enum(["pro", "business"]),
});

const PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { tier } = result.data;
    const priceId = PRICE_MAP[tier];

    if (!priceId) {
      return NextResponse.json(
        { status: "fail", message: "Price not configured for this tier" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const db = getDb();

    // Check if user already has a Stripe customer ID
    const [sub] = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    const checkoutParams: Record<string, unknown> = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?upgraded=1`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
      metadata: { userId: session.user.id, tier },
    };

    if (sub?.stripeCustomerId) {
      (checkoutParams as Record<string, unknown>).customer = sub.stripeCustomerId;
    } else {
      (checkoutParams as Record<string, unknown>).customer_email = session.user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      checkoutParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({
      status: "success",
      data: { url: checkoutSession.url },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
