import Link from "next/link";
import {
  Globe,
  Shield,
  Zap,
  BarChart3,
  Code2,
  Lock,
  Webhook,
  Check,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GeoKit — IP Geolocation & Geo-Blocking API for Developers",
  description:
    "Fast, affordable IP geolocation and geo-blocking API. Built for developers. Country lookups, VPN detection, and blocklist management. Free tier available.",
  openGraph: {
    title: "GeoKit — IP Geolocation & Geo-Blocking API",
    description:
      "Fast, affordable IP geolocation and geo-blocking API. Built for developers.",
    type: "website",
    siteName: "GeoKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoKit — IP Geolocation & Geo-Blocking API",
    description:
      "Fast, affordable IP geolocation and geo-blocking API. Built for developers.",
  },
};

const features = [
  {
    icon: Globe,
    title: "IP Geolocation",
    description:
      "Resolve any IPv4/IPv6 to country, region, city, timezone and coordinates.",
  },
  {
    icon: Shield,
    title: "Geo-Blocking",
    description:
      "Block or allow traffic by country with a simple deny/allow rules engine.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description:
      "Sub-50ms responses globally. 99.9% uptime SLA on Business plans.",
  },
  {
    icon: Lock,
    title: "VPN Detection",
    description:
      "Detect VPNs, proxies, and Tor exit nodes to prevent circumvention.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time lookups, blocked requests, and geographic heatmaps.",
  },
  {
    icon: Webhook,
    title: "Webhook Events",
    description:
      "Receive real-time notifications on lookups, blocks, and quota events.",
  },
];

const competitors = [
  { name: "ipstack", freeQuota: "100/mo", price: "$10/mo", vpn: false, blocklist: false, webhooks: false },
  { name: "ipapi", freeQuota: "1K/mo", price: "$12/mo", vpn: false, blocklist: false, webhooks: false },
  { name: "MaxMind", freeQuota: "1K/day", price: "$25/mo", vpn: true, blocklist: false, webhooks: false },
  { name: "GeoKit", freeQuota: "1K/day", price: "$9/mo", vpn: true, blocklist: true, webhooks: true },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For hobby projects and testing",
    features: [
      "1,000 lookups/day",
      "1 API key",
      "Country blocklist (10 rules)",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For growing SaaS apps",
    features: [
      "Unlimited lookups",
      "5 API keys",
      "Country blocklist (100 rules)",
      "Webhook notifications",
      "Priority support",
      "VPN detection",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For scaling teams",
    features: [
      "Unlimited lookups",
      "Unlimited API keys",
      "Unlimited blocklist rules",
      "Webhook notifications",
      "Dedicated support",
      "VPN detection",
      "IP allowlist",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const curlSnippet = `$ curl https://api.geokit.dev/v1/geoip/8.8.8.8 \\
  -H "X-API-Key: gk_live_a3f8..."

{
  "ip": "8.8.8.8",
  "country": "US",
  "region": "California",
  "city": "Mountain View",
  "lat": 37.386,
  "lng": -122.084,
  "timezone": "America/Los_Angeles",
  "vpn": false
}`;

const nextjsSnippet = `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "0.0.0.0";

  const res = await fetch(
    \`https://api.geokit.dev/v1/check/\${ip}\`,
    { headers: { "X-API-Key": process.env.GEOKIT_KEY! } }
  );
  const { blocked } = await res.json();

  if (blocked) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }
  return NextResponse.next();
}`;

function LandingJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GeoKit",
    applicationCategory: "DeveloperApplication",
    description:
      "IP geolocation and geo-blocking API for developers. Fast, reliable, and affordable.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
      },
      {
        "@type": "Offer",
        price: "9",
        priceCurrency: "USD",
        name: "Pro",
      },
      {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        name: "Business",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function LandingPage() {
  return (
    <>
      <LandingJsonLd />
      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold">GeoKit</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-background to-background" />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <Badge className="mb-4 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20">
              Now in Public Beta
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              IP Geolocation &{" "}
              <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                Geo-Blocking API
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Resolve IPs to countries, block unwanted traffic, and detect VPNs.
              Built for developers who need a fast, affordable alternative to
              ipstack and MaxMind.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Code examples */}
        <section className="border-y border-border bg-card/30 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-muted-foreground">
                    curl
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-lg border bg-background p-4 text-sm leading-relaxed">
                  <code className="text-primary-300">{curlSnippet}</code>
                </pre>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Next.js Middleware
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-lg border bg-background p-4 text-sm leading-relaxed">
                  <code className="text-primary-300">{nextjsSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need for geo-aware apps
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                From simple IP lookups to advanced geo-blocking rules.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card/50">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600/10">
                      <feature.icon className="h-5 w-5 text-primary-400" />
                    </div>
                    <CardTitle className="text-base">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-y border-border bg-card/30 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                How GeoKit compares
              </h2>
              <p className="mt-3 text-muted-foreground">
                More features, better pricing.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Provider
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Free Tier
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Paid From
                    </th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">
                      VPN
                    </th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">
                      Blocklist
                    </th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">
                      Webhooks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => (
                    <tr
                      key={c.name}
                      className={cn(
                        "border-b border-border",
                        c.name === "GeoKit" && "bg-primary-600/5"
                      )}
                    >
                      <td className="py-3 font-medium">
                        {c.name}
                        {c.name === "GeoKit" && (
                          <Badge className="ml-2 bg-primary-600 text-xs text-white">
                            You
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {c.freeQuota}
                      </td>
                      <td className="py-3 text-muted-foreground">{c.price}</td>
                      <td className="py-3 text-center">
                        {c.vpn ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {c.blocklist ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {c.webhooks ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free. Scale as you grow.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col",
                    plan.highlighted &&
                      "border-primary-600 shadow-lg shadow-primary-600/10"
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-primary-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sign up in 30 seconds. No credit card required.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary-400" />
              <span>GeoKit</span>
            </div>
            <p>&copy; {new Date().getFullYear()} GeoKit. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
