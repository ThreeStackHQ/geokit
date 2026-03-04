import { NextResponse } from "next/server";
import net from "net";
import { lookupIP } from "@geokit/geoip";
import { validateApiKey } from "@/lib/api-key";
import { checkRateLimit } from "@/lib/rate-limit";
import { isWithinDailyQuota, incrementDailyQuota } from "@/lib/tier";
import { getDb, blocklists, lookupLogs, eq } from "@geokit/db";
import { deliverWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: { ip: string } }
): Promise<NextResponse> {
  try {
    const apiKey = await validateApiKey(request.headers.get("x-api-key"));
    if (!apiKey) {
      return NextResponse.json(
        { status: "fail", message: "Invalid or missing API key", code: "UNAUTHORIZED" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { allowed: rateLimitOk, remaining } = checkRateLimit(apiKey.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { status: "fail", message: "Rate limit exceeded", code: "RATE_LIMITED" },
        { status: 429, headers: { ...corsHeaders, "Retry-After": "60" } }
      );
    }

    // SEC-001: Daily quota enforcement
    const withinQuota = await isWithinDailyQuota(apiKey.workspaceId);
    if (!withinQuota) {
      return NextResponse.json(
        { status: "fail", message: "Daily quota exceeded", code: "QUOTA_EXCEEDED" },
        { status: 429, headers: corsHeaders }
      );
    }

    const ip = params.ip;

    // SEC-003: Validate IP address
    if (net.isIP(ip) === 0) {
      return NextResponse.json(
        { status: "fail", message: "Invalid IP address", code: "BAD_REQUEST" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = getDb();

    // Run geoip lookup and blocklist fetch in parallel
    const [geoResult, rules] = await Promise.all([
      Promise.resolve(lookupIP(ip)),
      db
        .select()
        .from(blocklists)
        .where(eq(blocklists.workspaceId, apiKey.workspaceId)),
    ]);

    // Private IP — always allowed
    if (geoResult.is_private) {
      return NextResponse.json(
        {
          status: "success",
          data: { allowed: true, country_code: null, is_private: true },
        },
        { status: 200, headers: { ...corsHeaders, "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const countryCode = geoResult.country_code;
    const denyRules = rules.filter((r) => r.type === "deny");
    const allowRules = rules.filter((r) => r.type === "allow");

    let blocked = false;
    let reason: string | undefined;

    // Check deny list
    if (countryCode && denyRules.some((r) => r.countryCode === countryCode)) {
      blocked = true;
      reason = `Country ${countryCode} is on the deny list`;
    }

    // Check allow list (if allow rules exist and country not in them)
    if (!blocked && allowRules.length > 0 && countryCode) {
      if (!allowRules.some((r) => r.countryCode === countryCode)) {
        blocked = true;
        reason = `Country ${countryCode} is not on the allow list`;
      }
    }

    // Log lookup and increment quota in background
    setImmediate(() => {
      db.insert(lookupLogs)
        .values({
          workspaceId: apiKey.workspaceId,
          ip,
          countryCode,
          isVpn: geoResult.is_vpn,
          blocked,
          apiKeyId: apiKey.id,
        })
        .then(() => {})
        .catch(() => {});

      // SEC-001: Increment daily quota
      incrementDailyQuota(apiKey.workspaceId).catch(() => {});
    });

    // Fire webhook if blocked
    if (blocked) {
      deliverWebhook(
        "geo.blocked",
        { ip, country_code: countryCode, reason },
        apiKey.workspaceId
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          allowed: !blocked,
          reason: blocked ? reason : undefined,
          country_code: countryCode,
          is_private: false,
        },
      },
      { status: 200, headers: { ...corsHeaders, "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Check error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
