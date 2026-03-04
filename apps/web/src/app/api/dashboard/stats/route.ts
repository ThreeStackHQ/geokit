import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, lookupLogs, workspaces, eq, and, gte, sql, desc } from "@geokit/db";

export const dynamic = "force-dynamic";

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

    // Get user's workspace
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

    const now = new Date();
    const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const wsFilter = eq(lookupLogs.workspaceId, workspace.id);

    // Run all queries in parallel
    const [lookups24h, lookups7d, lookups30d, blocked24h, vpnDetected24h, topCountries] =
      await Promise.all([
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(lookupLogs)
          .where(and(wsFilter, gte(lookupLogs.createdAt, h24))),
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(lookupLogs)
          .where(and(wsFilter, gte(lookupLogs.createdAt, d7))),
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(lookupLogs)
          .where(and(wsFilter, gte(lookupLogs.createdAt, d30))),
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(lookupLogs)
          .where(
            and(wsFilter, gte(lookupLogs.createdAt, h24), eq(lookupLogs.blocked, true))
          ),
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(lookupLogs)
          .where(
            and(wsFilter, gte(lookupLogs.createdAt, h24), eq(lookupLogs.isVpn, true))
          ),
        db
          .select({
            code: lookupLogs.countryCode,
            count: sql<number>`count(*)::int`,
          })
          .from(lookupLogs)
          .where(and(wsFilter, gte(lookupLogs.createdAt, d30)))
          .groupBy(lookupLogs.countryCode)
          .orderBy(desc(sql`count(*)`))
          .limit(10),
      ]);

    return NextResponse.json({
      status: "success",
      data: {
        lookups_24h: lookups24h[0]?.value ?? 0,
        lookups_7d: lookups7d[0]?.value ?? 0,
        lookups_30d: lookups30d[0]?.value ?? 0,
        blocked_24h: blocked24h[0]?.value ?? 0,
        vpn_detected_24h: vpnDetected24h[0]?.value ?? 0,
        top_countries: topCountries.map((c) => ({
          code: c.code,
          count: c.count,
        })),
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
