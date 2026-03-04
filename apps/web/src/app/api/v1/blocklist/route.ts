import { NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key";
import { getDb, blocklists, eq, and, count } from "@geokit/db";

export const dynamic = "force-dynamic";

const createBlocklistSchema = z.object({
  type: z.enum(["deny", "allow"]),
  country_code: z.string().regex(/^[A-Z]{2}$/, "Must be a 2-char ISO country code"),
  note: z.string().max(500).optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const apiKey = await validateApiKey(request.headers.get("x-api-key"));
    if (!apiKey) {
      return NextResponse.json(
        { status: "fail", message: "Invalid or missing API key", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const db = getDb();
    const rules = await db
      .select()
      .from(blocklists)
      .where(eq(blocklists.workspaceId, apiKey.workspaceId));

    return NextResponse.json({ status: "success", data: rules });
  } catch (error) {
    console.error("Blocklist GET error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const apiKey = await validateApiKey(request.headers.get("x-api-key"));
    if (!apiKey) {
      return NextResponse.json(
        { status: "fail", message: "Invalid or missing API key", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const result = createBlocklistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const db = getDb();

    // Check max 100 rules per workspace
    const [{ value: ruleCount }] = await db
      .select({ value: count() })
      .from(blocklists)
      .where(eq(blocklists.workspaceId, apiKey.workspaceId));

    if (ruleCount >= 100) {
      return NextResponse.json(
        { status: "fail", message: "Maximum 100 blocklist rules per workspace", code: "LIMIT_EXCEEDED" },
        { status: 400 }
      );
    }

    const { type, country_code, note } = result.data;

    const [rule] = await db
      .insert(blocklists)
      .values({
        workspaceId: apiKey.workspaceId,
        type,
        countryCode: country_code,
        note: note ?? null,
      })
      .returning();

    return NextResponse.json({ status: "success", data: rule }, { status: 201 });
  } catch (error) {
    console.error("Blocklist POST error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
