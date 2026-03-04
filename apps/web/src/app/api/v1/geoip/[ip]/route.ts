import { NextResponse } from "next/server";
import net from "net";
import { lookupIP } from "@geokit/geoip";
import { validateApiKey } from "@/lib/api-key";
import { checkRateLimit } from "@/lib/rate-limit";
import { isWithinDailyQuota, incrementDailyQuota } from "@/lib/tier";
import { getDb, lookupLogs } from "@geokit/db";

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
    const apiKeyHeader = request.headers.get("x-api-key");
    const apiKey = await validateApiKey(apiKeyHeader);

    if (!apiKey) {
      return NextResponse.json(
        { status: "fail", message: "Invalid or missing API key", code: "UNAUTHORIZED" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { allowed, remaining } = checkRateLimit(apiKey.id);
    if (!allowed) {
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

    const result = lookupIP(ip);

    // Log lookup and increment quota in background
    setImmediate(() => {
      const db = getDb();
      db.insert(lookupLogs)
        .values({
          workspaceId: apiKey.workspaceId,
          ip,
          countryCode: result.country_code,
          isVpn: result.is_vpn,
          blocked: false,
          apiKeyId: apiKey.id,
        })
        .then(() => {})
        .catch(() => {});

      // SEC-001: Increment daily quota
      incrementDailyQuota(apiKey.workspaceId).catch(() => {});
    });

    return NextResponse.json(
      { status: "success", data: result },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  } catch (error) {
    console.error("GeoIP lookup error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
