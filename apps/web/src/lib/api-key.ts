import bcrypt from "bcryptjs";
import { getDb, workspaceApiKeys, eq, and } from "@geokit/db";
import type { InferSelectModel } from "@geokit/db";

type ApiKey = InferSelectModel<typeof workspaceApiKeys>;

export async function validateApiKey(
  apiKeyHeader: string | null
): Promise<ApiKey | null> {
  if (!apiKeyHeader) return null;

  const prefix = apiKeyHeader.substring(0, 8);
  const db = getDb();

  const candidates = await db
    .select()
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.keyPrefix, prefix),
        // Only non-revoked keys
      )
    );

  for (const candidate of candidates) {
    if (candidate.revokedAt) continue;

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
