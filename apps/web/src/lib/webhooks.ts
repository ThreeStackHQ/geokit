import crypto from "crypto";
import { getDb, webhookEndpoints, eq } from "@geokit/db";
import type { InferSelectModel } from "@geokit/db";

type WebhookEndpoint = InferSelectModel<typeof webhookEndpoints>;

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const RETRY_DELAYS = [0, 5000, 30000];

// SEC-008: Defense-in-depth SSRF check at delivery time
// BUG-001 FIX: Node.js URL parser returns IPv6 with brackets e.g. "[::1]",
// so we must strip brackets before comparing.
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    // Strip IPv6 brackets for bare comparison
    const hostBare = hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;
    return !(
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostBare === "::1" ||
      hostBare.startsWith("::ffff:127.") ||
      hostBare.startsWith("fe80:") ||
      hostBare.startsWith("fc00:") ||
      hostBare.startsWith("fd") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.endsWith(".internal") ||
      hostname === "metadata.google.internal"
    );
  } catch {
    return false;
  }
}

async function sendWebhook(
  endpoint: WebhookEndpoint,
  payload: WebhookPayload
): Promise<boolean> {
  if (!isSafeUrl(endpoint.url)) return false;

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", endpoint.secret)
    .update(body)
    .digest("hex");

  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    if (RETRY_DELAYS[attempt] > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GeoKit-Signature": `sha256=${signature}`,
          "X-GeoKit-Event": payload.event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) return true;
    } catch {
      // retry
    }
  }
  return false;
}

export function deliverWebhook(
  event: string,
  data: Record<string, unknown>,
  workspaceId: string
): void {
  setImmediate(() => {
    const db = getDb();
    db.select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.workspaceId, workspaceId))
      .then((endpoints) => {
        const activeEndpoints = endpoints.filter(
          (ep) => ep.active && ep.events.includes(event)
        );
        const payload: WebhookPayload = {
          event,
          data,
          timestamp: new Date().toISOString(),
        };
        for (const ep of activeEndpoints) {
          sendWebhook(ep, payload).catch(() => {});
        }
      })
      .catch(() => {});
  });
}
