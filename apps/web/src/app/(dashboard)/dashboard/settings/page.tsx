"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your workspace settings
        </p>
      </div>

      {/* Webhook settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhooks</CardTitle>
          <CardDescription>
            Receive real-time notifications when events occur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhooks</Label>
              <p className="text-xs text-muted-foreground">
                Send HTTP POST requests on lookup events
              </p>
            </div>
            <Switch
              checked={webhookEnabled}
              onCheckedChange={setWebhookEnabled}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-app.com/api/webhooks/geokit"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={!webhookEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Signing Secret</Label>
            <Input
              id="webhook-secret"
              type="password"
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              disabled={!webhookEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Used to verify webhook signatures (HMAC-SHA256).
            </p>
          </div>
          <Button disabled={!webhookEnabled}>
            <Save className="mr-2 h-4 w-4" />
            Save Webhook
          </Button>
        </CardContent>
      </Card>

      {/* IP Allowlist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">IP Allowlist</CardTitle>
          <CardDescription>
            Restrict API access to specific IP addresses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip-allowlist">Allowed IPs</Label>
            <Textarea
              id="ip-allowlist"
              placeholder={"1.2.3.4\n10.0.0.0/8\n192.168.1.0/24"}
              value={ipAllowlist}
              onChange={(e) => setIpAllowlist(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              One IP or CIDR per line. Leave empty to allow all.
            </p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Allowlist
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Workspace</Button>
        </CardContent>
      </Card>
    </div>
  );
}
