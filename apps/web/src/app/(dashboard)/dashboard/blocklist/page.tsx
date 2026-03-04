"use client";

import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockBlocklistRules,
  allCountries,
  type BlocklistRule,
  type Country,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function BlocklistPage() {
  const [rules, setRules] = useState<BlocklistRule[]>(mockBlocklistRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [action, setAction] = useState<"deny" | "allow">("deny");

  function handleAdd() {
    if (!selectedCountry) return;
    const newRule: BlocklistRule = {
      id: String(Date.now()),
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      flag: selectedCountry.flag,
      action,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRules([...rules, newRule]);
    setSelectedCountry(null);
    setAction("deny");
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setRules(rules.filter((r) => r.id !== id));
  }

  const denyCount = rules.filter((r) => r.action === "deny").length;
  const allowCount = rules.filter((r) => r.action === "allow").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blocklist</h1>
          <p className="mt-1 text-muted-foreground">
            Manage country-level deny and allow rules
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Blocklist Rule</DialogTitle>
              <DialogDescription>
                Select a country and action to add a new rule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-between"
                    >
                      {selectedCountry ? (
                        <span>
                          {selectedCountry.flag} {selectedCountry.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Search countries...
                        </span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {allCountries.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.name}
                              onSelect={() => {
                                setSelectedCountry(country);
                                setSearchOpen(false);
                              }}
                            >
                              <span className="mr-2">{country.flag}</span>
                              {country.name}
                              <span className="ml-auto text-xs text-muted-foreground">
                                {country.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={action}
                  onValueChange={(v) => setAction(v as "deny" | "allow")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deny">Deny</SelectItem>
                    <SelectItem value="allow">Allow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!selectedCountry}>
                Add Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Denied Countries</CardDescription>
            <CardTitle className="text-2xl">{denyCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Allowed Countries</CardDescription>
            <CardTitle className="text-2xl">{allowCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Rules table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{rule.flag}</span>
                      <span className="font-medium">{rule.country}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rule.countryCode}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        rule.action === "deny"
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      {rule.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rule.createdAt}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No blocklist rules. Click &quot;Add Rule&quot; to get
                    started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
