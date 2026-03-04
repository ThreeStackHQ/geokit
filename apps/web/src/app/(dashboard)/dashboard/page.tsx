"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockStats,
  mockChartData,
  mockCountryData,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const changeIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your GeoKit usage
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mockStats.map((stat) => {
          const Icon = changeIcons[stat.changeType];
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div
                  className={cn(
                    "mt-1 flex items-center text-xs",
                    stat.changeType === "up" && "text-emerald-500",
                    stat.changeType === "down" && "text-red-500",
                    stat.changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {stat.change} vs previous period
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Country heatmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lookups over time bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lookups over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                  <Legend />
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

        {/* Country heatmap / top countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Top Countries
            </CardTitle>
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
