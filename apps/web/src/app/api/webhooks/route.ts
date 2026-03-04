import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb, webhookEndpoints, workspaces, eq, and } from "@geokit/db";

export const dynamic = "force-dynamic";

const createWebhookSchema = z.object({
  url: z.string().url().max(2048),
  events: z.array(z.string()).min(1).max(10).default(["geo.blocked"]),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getDb();
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.userId, session.user.id))
      .limit(1);

    if (!workspace) {
      return NextResponse.json(
        { status: "fail", message: "Workspace not found" },
        { status: 404 }
      );
    }

    const endpoints = await db
      .select({
        id: webhookEndpoints.id,
        url: webhookEndpoints.url,
        events: webhookEndpoints.events,
        active: webhookEndpoints.active,
        createdAt: webhookEndpoints.createdAt,
      })
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.workspaceId, workspace.id));

    return NextResponse.json({ status: "success", data: endpoints });
  } catch (error) {
    console.error("Webhooks GET error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const result = createWebhookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const db = getDb();
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.userId, session.user.id))
      .limit(1);

    if (!workspace) {
      return NextResponse.json(
        { status: "fail", message: "Workspace not found" },
        { status: 404 }
      );
    }

    const secret = crypto.randomBytes(32).toString("hex");

    const [endpoint] = await db
      .insert(webhookEndpoints)
      .values({
        workspaceId: workspace.id,
        url: result.data.url,
        secret,
        events: result.data.events,
      })
      .returning();

    return NextResponse.json(
      {
        status: "success",
        data: {
          id: endpoint.id,
          url: endpoint.url,
          secret, // Returned only once
          events: endpoint.events,
          active: endpoint.active,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhooks POST error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: "fail", message: "Missing webhook ID" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.userId, session.user.id))
      .limit(1);

    if (!workspace) {
      return NextResponse.json(
        { status: "fail", message: "Workspace not found" },
        { status: 404 }
      );
    }

    const [endpoint] = await db
      .select({ id: webhookEndpoints.id })
      .from(webhookEndpoints)
      .where(
        and(
          eq(webhookEndpoints.id, id),
          eq(webhookEndpoints.workspaceId, workspace.id)
        )
      )
      .limit(1);

    if (!endpoint) {
      return NextResponse.json(
        { status: "fail", message: "Webhook not found" },
        { status: 404 }
      );
    }

    await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Webhooks DELETE error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
