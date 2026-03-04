import { NextResponse } from "next/server";
import { lookupIP } from "@geokit/geoip";
import { validateApiKey } from "@/lib/api-key";
import { checkRateLimit } from "@/lib/rate-limit";
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

    const ip = params.ip;
    const result = lookupIP(ip);

    // Log lookup in background
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
