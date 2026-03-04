import * as geoip from "geoip-lite";

export interface GeoResult {
  ip: string;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  is_vpn: boolean;
  is_tor: boolean;
  is_private: boolean;
  latitude: number | null;
  longitude: number | null;
}

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
];

const PRIVATE_IPV6 = ["::1", "::ffff:127.0.0.1", "fe80::", "fc00::", "fd00::"];

function isPrivateIP(ip: string): boolean {
  if (PRIVATE_IPV4_RANGES.some((r) => r.test(ip))) return true;
  const lower = ip.toLowerCase();
  if (PRIVATE_IPV6.some((prefix) => lower.startsWith(prefix))) return true;
  if (lower === "::1") return true;
  return false;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
  NL: "Netherlands", CA: "Canada", AU: "Australia", JP: "Japan",
  CN: "China", RU: "Russia", BR: "Brazil", IN: "India", KR: "South Korea",
  IT: "Italy", ES: "Spain", MX: "Mexico", SE: "Sweden", NO: "Norway",
  FI: "Finland", DK: "Denmark", PL: "Poland", AT: "Austria", CH: "Switzerland",
  BE: "Belgium", IE: "Ireland", PT: "Portugal", CZ: "Czech Republic",
  RO: "Romania", HU: "Hungary", UA: "Ukraine", ZA: "South Africa",
  SG: "Singapore", HK: "Hong Kong", TW: "Taiwan", NZ: "New Zealand",
  AR: "Argentina", CL: "Chile", CO: "Colombia", KP: "North Korea",
  IL: "Israel", AE: "United Arab Emirates", SA: "Saudi Arabia",
  TR: "Turkey", TH: "Thailand", PH: "Philippines", MY: "Malaysia",
  ID: "Indonesia", VN: "Vietnam", EG: "Egypt", NG: "Nigeria", KE: "Kenya",
};

export function lookupIP(ip: string): GeoResult {
  if (isPrivateIP(ip)) {
    return {
      ip,
      country_code: null,
      country_name: null,
      region: null,
      city: null,
      timezone: null,
      is_vpn: false,
      is_tor: false,
      is_private: true,
      latitude: null,
      longitude: null,
    };
  }

  const geo = geoip.lookup(ip);

  if (!geo) {
    return {
      ip,
      country_code: null,
      country_name: null,
      region: null,
      city: null,
      timezone: null,
      is_vpn: false,
      is_tor: false,
      is_private: false,
      latitude: null,
      longitude: null,
    };
  }

  return {
    ip,
    country_code: geo.country || null,
    country_name: COUNTRY_NAMES[geo.country] || geo.country || null,
    region: geo.region || null,
    city: geo.city || null,
    timezone: geo.timezone || null,
    is_vpn: false,
    is_tor: false,
    is_private: false,
    latitude: geo.ll?.[0] ?? null,
    longitude: geo.ll?.[1] ?? null,
  };
}
