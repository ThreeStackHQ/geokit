"use client";

import { Globe } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChartData, mockCountryData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Detailed breakdown of your API usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Lookups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240 3.7% 15.9%)"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(240 5% 64.9%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(240 5% 64.9%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(240 10% 5.5%)",
                    border: "1px solid hsl(240 3.7% 15.9%)",
                    borderRadius: "8px",
                    color: "hsl(0 0% 98%)",
                  }}
                />
                <Bar
                  dataKey="lookups"
                  fill="#818cf8"
                  radius={[4, 4, 0, 0]}
                  name="Lookups"
                />
                <Bar
                  dataKey="blocked"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  name="Blocked"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* World map placeholder + country table */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
              <div className="text-center text-muted-foreground">
                <Globe className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">World Map</p>
                <p className="text-xs">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCountryData.map((country, i) => {
                const maxLookups = mockCountryData[0].lookups;
                const pct = (country.lookups / maxLookups) * 100;
                return (
                  <div key={country.code} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {country.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {country.lookups.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
