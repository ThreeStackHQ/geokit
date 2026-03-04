import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb, subscriptions, eq } from "@geokit/db";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { status: "fail", message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { status: "fail", message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json(
        { status: "fail", message: "Invalid signature" },
        { status: 400 }
      );
    }

    const db = getDb();

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) break;

        const tier = (subscription.metadata.tier as "pro" | "business") ?? "pro";
        const status = subscription.status === "active"
          ? "active"
          : subscription.status === "past_due"
          ? "past_due"
          : "canceled";

        await db
          .update(subscriptions)
          .set({
            tier,
            status,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId));

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) break;

        await db
          .update(subscriptions)
          .set({
            tier: "free",
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId));

        break;
      }
    }

    return NextResponse.json({ status: "success", data: { received: true } });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
