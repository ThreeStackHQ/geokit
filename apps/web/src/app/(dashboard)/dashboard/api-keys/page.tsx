"use client";

import { useState } from "react";
import { Plus, Copy, Check, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockApiKeys, type ApiKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(true);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    if (!keyName.trim()) return;
    const generatedKey = `gk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    const prefix = generatedKey.slice(0, 12);
    const newKey: ApiKey = {
      id: String(Date.now()),
      name: keyName.trim(),
      prefix,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: null,
      status: "active",
    };
    setKeys([newKey, ...keys]);
    setNewKeyValue(generatedKey);
    setKeyName("");
    setCreateOpen(false);
  }

  function handleCopy() {
    if (!newKeyValue) return;
    navigator.clipboard.writeText(newKeyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDismissNewKey() {
    setNewKeyValue(null);
    setShowNewKey(true);
    setCopied(false);
  }

  function handleRevoke(id: string) {
    setKeys(
      keys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
  }

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your API keys
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your key a name to help you identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="e.g. Production, Staging, Development"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!keyName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* One-time key display */}
      {newKeyValue && (
        <Card className="border-primary-600/50 bg-primary-600/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-400">
              Your new API key
            </CardTitle>
            <CardDescription>
              Copy this key now. You won&apos;t be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-background px-3 py-2 font-mono text-sm">
                {showNewKey ? newKeyValue : "\u2022".repeat(newKeyValue.length)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewKey(!showNewKey)}
              >
                {showNewKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleDismissNewKey}>
              I&apos;ve copied my key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Keys</CardDescription>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Keys</CardDescription>
            <CardTitle className="text-2xl">{keys.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Keys table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-secondary px-2 py-0.5 text-xs">
                      {key.prefix}...
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {key.createdAt}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {key.lastUsedAt ?? "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        key.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      )}
                    >
                      {key.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {key.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(key.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
