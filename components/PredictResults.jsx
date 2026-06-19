"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListFilter, Inbox, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { ChanceBadge } from "@/components/ChanceBadge";
import { CHANCE } from "@/lib/eligibility";
import { formatRank } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PredictResults({ matches, summary, taxonomy, basePath = "" }) {
  const [branch, setBranch] = useState([]); // selected branch codes
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [chances, setChances] = useState(["safe", "target", "reach"]);

  const branchesPresent = useMemo(() => {
    const set = new Map();
    for (const m of matches) set.set(m.branch, m.branchName);
    return [...set.entries()].map(([code, name]) => ({ code, name }));
  }, [matches]);

  const citiesPresent = useMemo(
    () => [...new Set(matches.map((m) => m.city))].sort(),
    [matches]
  );

  const filtered = useMemo(() => {
    const bset = branch.length ? new Set(branch) : null;
    return matches.filter(
      (m) =>
        chances.includes(m.chance) &&
        (!bset || bset.has(m.branch)) &&
        (city === "all" || m.city === city) &&
        (type === "all" || m.collegeType === type)
    );
  }, [matches, branch, city, type, chances]);

  if (matches.length === 0) {
    return (
      <div className="glass rounded-3xl border border-dashed border-border/60 p-12 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary/60">
          <Inbox className="size-7 text-muted-foreground" />
        </div>
        <p className="mt-4 text-lg font-bold">No colleges within reach for this rank.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a later round, or check another category you&apos;re eligible for.
        </p>
      </div>
    );
  }

  const toggleChance = (key) =>
    setChances((c) => (c.includes(key) ? c.filter((x) => x !== key) : [...c, key]));
  const toggleBranch = (code) =>
    setBranch((b) => (b.includes(code) ? b.filter((x) => x !== code) : [...b, code]));

  return (
    <div className="space-y-5">
      {/* summary */}
      <div className="grid grid-cols-2 gap-3 stagger sm:grid-cols-4">
        <Stat label="Colleges" value={summary.colleges} />
        <Stat label="Safe" value={summary.safe} tone="safe" onClick={() => setChances(["safe"])} />
        <Stat label="Target" value={summary.target} tone="target" onClick={() => setChances(["target"])} />
        <Stat label="Reach" value={summary.reach} tone="reach" onClick={() => setChances(["reach"])} />
      </div>

      {/* chance toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ListFilter className="size-3.5" /> Chance
        </span>
        {Object.values(CHANCE).map((c) => (
          <button
            key={c.key}
            onClick={() => toggleChance(c.key)}
            className={cn(
              "pressable rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              chances.includes(c.key)
                ? c.className
                : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-xs font-medium text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* branch + city + type filters */}
      <div className="glass space-y-3 rounded-2xl border border-border/50 p-4">
        <div className="flex flex-wrap gap-1.5">
          {branchesPresent.map((b) => (
            <button
              key={b.code}
              onClick={() => toggleBranch(b.code)}
              className={cn(
                "pressable rounded-full border px-3 py-1.5 text-xs font-medium",
                branch.includes(b.code)
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
              title={b.name}
            >
              {b.code}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:max-w-md sm:grid-cols-2">
          <Select
            aria-label="City"
            value={city}
            onChange={setCity}
            options={[
              { value: "all", label: "All cities" },
              ...citiesPresent.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            aria-label="College type"
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: "All types" },
              ...taxonomy.collegeTypes.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>
      </div>

      {/* ── Mobile: stacked cards ── */}
      <div className="space-y-2.5 stagger sm:hidden">
        {filtered.map((m) => (
          <Link
            key={`${m.collegeCode}-${m.branch}`}
            href={`${basePath}/colleges/${m.collegeCode}`}
            className="glass pressable flex items-center gap-3 rounded-2xl border border-border/50 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold">{m.short}</span>
                <ChanceBadge chance={m.chance} />
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {m.city} · {m.collegeType}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 font-mono text-xs">
                  {m.branch}
                </span>
                <span className="truncate text-muted-foreground">{m.branchName}</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span>
                  <span className="text-muted-foreground">Closing </span>
                  <span className="font-mono font-bold text-primary">
                    {formatRank(m.closingRank)}
                  </span>
                </span>
              </div>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No results match these filters.
          </p>
        )}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/50 sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead>College</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-center">Closing rank</TableHead>
              <TableHead className="text-right">Chance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow
                key={`${m.collegeCode}-${m.branch}`}
                className="transition-colors hover:bg-secondary/30"
              >
                <TableCell>
                  <Link
                    href={`${basePath}/colleges/${m.collegeCode}`}
                    className="font-semibold hover:text-primary"
                  >
                    {m.short}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {m.city} · {m.collegeType}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{m.branch}</span>{" "}
                  <span className="text-sm">{m.branchName}</span>
                </TableCell>
                <TableCell className="text-center font-mono font-bold text-primary">
                  {formatRank(m.closingRank)}
                </TableCell>
                <TableCell className="text-right">
                  <ChanceBadge chance={m.chance} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No results match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone, onClick }) {
  const toneCls =
    tone && CHANCE[tone] ? CHANCE[tone].className : "border-border/50 glass";
  return (
    <button
      onClick={onClick}
      className={cn(
        "pressable rounded-2xl border p-4 text-left",
        toneCls
      )}
    >
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs font-medium opacity-80">{label}</div>
    </button>
  );
}
