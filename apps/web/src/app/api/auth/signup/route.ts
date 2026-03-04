import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { getDb, users, workspaces, workspaceApiKeys, subscriptions, eq } from "@geokit/db";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email, password, name } = result.data;
    const db = getDb();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { status: "fail", message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name: name ?? null })
      .returning({ id: users.id, email: users.email });

    const [workspace] = await db
      .insert(workspaces)
      .values({ userId: user.id, name: "Default Workspace" })
      .returning({ id: workspaces.id });

    await db.insert(subscriptions).values({
      userId: user.id,
      tier: "free",
      status: "active",
    });

    // Generate API key: ik_live_ prefix + 32 random bytes hex = 72 chars total
    const randomPart = crypto.randomBytes(32).toString("hex");
    const apiKey = `ik_live_${randomPart}`;
    const keyPrefix = apiKey.substring(0, 8);
    const keyHash = await bcrypt.hash(apiKey, 10);

    await db.insert(workspaceApiKeys).values({
      workspaceId: workspace.id,
      name: "Default API Key",
      keyPrefix,
      keyHash,
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          user: { id: user.id, email: user.email },
          workspace: { id: workspace.id },
          apiKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
