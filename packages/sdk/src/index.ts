export interface GeoBlockingOptions {
  apiKey: string;
  apiUrl?: string;
  denyCountries?: string[];
  allowCountries?: string[];
  redirectTo?: string;
  blockResponse?: { status: number; body: string };
}

interface CheckResponse {
  status: string;
  data: {
    allowed: boolean;
    reason?: string;
    country_code?: string;
    is_private?: boolean;
  };
}

interface NextRequest {
  ip?: string;
  headers: { get(name: string): string | null };
  url: string;
}

interface NextResponse {
  headers: { set(name: string, value: string): void };
}

interface NextResponseStatic {
  json(body: unknown, init?: { status?: number }): NextResponse;
  redirect(url: string | URL): NextResponse;
  next(): NextResponse;
}

declare const NextResponse: NextResponseStatic;

export function withGeoBlocking(options: GeoBlockingOptions) {
  const {
    apiKey,
    apiUrl = "https://geokit.threestack.io",
    denyCountries,
    allowCountries,
    redirectTo,
    blockResponse = { status: 403, body: JSON.stringify({ error: "Access denied based on your location" }) },
  } = options;

  return async function middleware(request: NextRequest): Promise<NextResponse> {
    try {
      // Get IP from x-forwarded-for or request.ip
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || request.ip || "127.0.0.1";

      const res = await fetch(`${apiUrl}/api/v1/check/${encodeURIComponent(ip)}`, {
        headers: { "X-API-Key": apiKey },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        // Fail open — don't block users on API errors
        const response = NextResponse.next();
        response.headers.set("x-geokit-error", "api-error");
        return response;
      }

      const data = (await res.json()) as CheckResponse;

      if (data.data.allowed) {
        const response = NextResponse.next();
        if (data.data.country_code) {
          response.headers.set("x-geokit-country", data.data.country_code);
        }
        return response;
      }

      // Blocked
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }

      const blockedResponse = NextResponse.json(
        JSON.parse(blockResponse.body),
        { status: blockResponse.status }
      );
      if (data.data.country_code) {
        blockedResponse.headers.set("x-geokit-country", data.data.country_code);
      }
      return blockedResponse;
    } catch {
      // Fail open on network errors
      const response = NextResponse.next();
      response.headers.set("x-geokit-error", "network-error");
      return response;
    }
  };
}
