import bcrypt from "bcryptjs";
import { getDb, workspaceApiKeys, eq, and, isNull } from "@geokit/db";
import type { InferSelectModel } from "@geokit/db";

type ApiKey = InferSelectModel<typeof workspaceApiKeys>;

export async function validateApiKey(
  apiKeyHeader: string | null
): Promise<ApiKey | null> {
  if (!apiKeyHeader) return null;

  // SEC-005: Reject obviously malformed keys early (expected format: ik_live_<64hex>)
  if (apiKeyHeader.length > 80 || apiKeyHeader.length < 10) return null;

  const prefix = apiKeyHeader.substring(0, 8);
  const db = getDb();

  // SEC-006: Filter revoked keys at DB level to avoid loading unnecessary data
  const candidates = await db
    .select()
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.keyPrefix, prefix),
        isNull(workspaceApiKeys.revokedAt)
      )
    );

  for (const candidate of candidates) {
    const isValid = await bcrypt.compare(apiKeyHeader, candidate.keyHash);
    if (isValid) {
      // Update lastUsedAt in background
      setImmediate(() => {
        db.update(workspaceApiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(workspaceApiKeys.id, candidate.id))
          .then(() => {})
          .catch(() => {});
      });
      return candidate;
    }
  }

  return null;
}
