export type Tier = "free" | "pro" | "business";

export interface MockUser {
  name: string;
  email: string;
  tier: Tier;
}

export const mockUser: MockUser = {
  name: "Quint",
  email: "quint@geokit.dev",
  tier: "pro",
};

export interface StatsCard {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
}

export const mockStats: StatsCard[] = [
  { label: "Lookups (24h)", value: "12,847", change: "+14%", changeType: "up" },
  { label: "Lookups (7d)", value: "78,321", change: "+8%", changeType: "up" },
  { label: "Lookups (30d)", value: "312,450", change: "+22%", changeType: "up" },
  { label: "Blocked (24h)", value: "1,203", change: "-3%", changeType: "down" },
  { label: "VPN Detected", value: "847", change: "+5%", changeType: "up" },
];

export interface ChartDataPoint {
  date: string;
  lookups: number;
  blocked: number;
}

export const mockChartData: ChartDataPoint[] = [
  { date: "Feb 4", lookups: 2400, blocked: 240 },
  { date: "Feb 5", lookups: 1398, blocked: 139 },
  { date: "Feb 6", lookups: 3800, blocked: 380 },
  { date: "Feb 7", lookups: 3908, blocked: 391 },
  { date: "Feb 8", lookups: 4800, blocked: 480 },
  { date: "Feb 9", lookups: 3800, blocked: 380 },
  { date: "Feb 10", lookups: 4300, blocked: 430 },
  { date: "Feb 11", lookups: 5200, blocked: 520 },
  { date: "Feb 12", lookups: 4100, blocked: 410 },
  { date: "Feb 13", lookups: 4600, blocked: 460 },
  { date: "Feb 14", lookups: 5800, blocked: 580 },
  { date: "Feb 15", lookups: 5100, blocked: 510 },
  { date: "Feb 16", lookups: 4900, blocked: 490 },
  { date: "Feb 17", lookups: 6200, blocked: 620 },
];

export interface CountryHeatmapEntry {
  code: string;
  name: string;
  flag: string;
  lookups: number;
}

export const mockCountryData: CountryHeatmapEntry[] = [
  { code: "US", name: "United States", flag: "🇺🇸", lookups: 45_230 },
  { code: "DE", name: "Germany", flag: "🇩🇪", lookups: 23_100 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lookups: 18_450 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", lookups: 15_320 },
  { code: "FR", name: "France", flag: "🇫🇷", lookups: 12_800 },
  { code: "JP", name: "Japan", flag: "🇯🇵", lookups: 11_200 },
  { code: "CA", name: "Canada", flag: "🇨🇦", lookups: 9_800 },
  { code: "AU", name: "Australia", flag: "🇦🇺", lookups: 8_400 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lookups: 7_200 },
  { code: "IN", name: "India", flag: "🇮🇳", lookups: 6_100 },
];

export interface BlocklistRule {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  action: "deny" | "allow";
  createdAt: string;
}

export const mockBlocklistRules: BlocklistRule[] = [
  { id: "1", country: "Russia", countryCode: "RU", flag: "🇷🇺", action: "deny", createdAt: "2025-01-15" },
  { id: "2", country: "China", countryCode: "CN", flag: "🇨🇳", action: "deny", createdAt: "2025-01-15" },
  { id: "3", country: "North Korea", countryCode: "KP", flag: "🇰🇵", action: "deny", createdAt: "2025-01-20" },
  { id: "4", country: "Iran", countryCode: "IR", flag: "🇮🇷", action: "deny", createdAt: "2025-02-01" },
  { id: "5", country: "Netherlands", countryCode: "NL", flag: "🇳🇱", action: "allow", createdAt: "2025-02-05" },
  { id: "6", country: "Germany", countryCode: "DE", flag: "🇩🇪", action: "allow", createdAt: "2025-02-05" },
];

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
}

export const mockApiKeys: ApiKey[] = [
  { id: "1", name: "Production", prefix: "gk_live_a3f8", createdAt: "2025-01-10", lastUsedAt: "2025-03-01", status: "active" },
  { id: "2", name: "Staging", prefix: "gk_test_b7d2", createdAt: "2025-01-15", lastUsedAt: "2025-02-28", status: "active" },
  { id: "3", name: "Old key", prefix: "gk_live_x9k1", createdAt: "2024-11-01", lastUsedAt: "2025-01-05", status: "revoked" },
];

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const allCountries: Country[] = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KP", name: "North Korea", flag: "🇰🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];
