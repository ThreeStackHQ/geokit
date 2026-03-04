import { NextResponse } from "next/server";
import { getDb, sql } from "@geokit/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const cronSecret = request.headers.get("authorization");
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    await db.execute(
      sql`DELETE FROM daily_quotas WHERE date < ${today}`
    );

    return NextResponse.json({
      status: "success",
      data: { message: "Quotas reset successfully" },
    });
  } catch (error) {
    console.error("Cron reset-quota error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
