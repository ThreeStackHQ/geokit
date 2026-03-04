"use client";

import { Check } from "lucide-react";

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

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For hobby projects",
    features: [
      "1,000 lookups/day",
      "1 API key",
      "Country blocklist (10 rules)",
      "Community support",
    ],
    cta: "Current Plan",
    disabled: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For growing SaaS",
    features: [
      "Unlimited lookups",
      "5 API keys",
      "Country blocklist (100 rules)",
      "Webhook notifications",
      "Priority support",
      "VPN detection",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
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
    cta: "Upgrade to Business",
    disabled: false,
    highlighted: false,
  },
];

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upgrade your plan</h1>
        <p className="mt-1 text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative flex flex-col",
              plan.highlighted && "border-primary-600 shadow-lg shadow-primary-600/10"
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
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
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
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
