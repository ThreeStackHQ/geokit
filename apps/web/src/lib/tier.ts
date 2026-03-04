import {
  getDb,
  subscriptions,
  dailyQuotas,
  eq,
  and,
  sql,
} from "@geokit/db";

type Tier = "free" | "pro" | "business";

const DAILY_LIMITS: Record<Tier, number> = {
  free: 1000,
  pro: Infinity,
  business: Infinity,
};

export async function getUserTier(userId: string): Promise<Tier> {
  const db = getDb();
  const [sub] = await db
    .select({ tier: subscriptions.tier })
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
    )
    .limit(1);

  return (sub?.tier as Tier) ?? "free";
}

export async function isWithinDailyQuota(workspaceId: string): Promise<boolean> {
  const db = getDb();

  // Get workspace's user tier
  const result = await db.execute(
    sql`SELECT s.tier FROM subscriptions s
        JOIN workspaces w ON w.user_id = s.user_id
        WHERE w.id = ${workspaceId}
        AND s.status = 'active'
        LIMIT 1`
  );

  const tier = ((result.rows?.[0] as Record<string, unknown>)?.tier as Tier) ?? "free";
  const limit = DAILY_LIMITS[tier];

  if (limit === Infinity) return true;

  const today = new Date().toISOString().split("T")[0];

  const [quota] = await db
    .select({ count: dailyQuotas.count })
    .from(dailyQuotas)
    .where(
      and(
        eq(dailyQuotas.workspaceId, workspaceId),
        eq(dailyQuotas.date, today)
      )
    )
    .limit(1);

  return (quota?.count ?? 0) < limit;
}

export async function incrementDailyQuota(workspaceId: string): Promise<void> {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];

  await db.execute(
    sql`INSERT INTO daily_quotas (id, workspace_id, date, count)
        VALUES (gen_random_uuid(), ${workspaceId}, ${today}, 1)
        ON CONFLICT (workspace_id, date)
        DO UPDATE SET count = daily_quotas.count + 1`
  );
}
