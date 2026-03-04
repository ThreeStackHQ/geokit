import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key";
import { getDb, blocklists, eq, and } from "@geokit/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const apiKey = await validateApiKey(request.headers.get("x-api-key"));
    if (!apiKey) {
      return NextResponse.json(
        { status: "fail", message: "Invalid or missing API key", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const db = getDb();

    const [rule] = await db
      .select()
      .from(blocklists)
      .where(
        and(
          eq(blocklists.id, params.id),
          eq(blocklists.workspaceId, apiKey.workspaceId)
        )
      )
      .limit(1);

    if (!rule) {
      return NextResponse.json(
        { status: "fail", message: "Rule not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await db
      .delete(blocklists)
      .where(eq(blocklists.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Blocklist DELETE error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
