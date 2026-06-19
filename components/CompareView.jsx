"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { formatRank } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CompareView({ colleges, colA, colB, taxonomy, basePath = "", defaultRound = "R1" }) {
  const router = useRouter();
  const [category, setCategory] = useState("GM");
  const [round, setRound] = useState(defaultRound);

  const setPick = (slot, code) => {
    const params = new URLSearchParams();
    const a = slot === "a" ? code : colA?.code;
    const b = slot === "b" ? code : colB?.code;
    if (a) params.set("a", a);
    if (b) params.set("b", b);
    router.push(`${basePath}/compare?${params.toString()}`);
  };

  const collegeOptions = [
    { value: "", label: "Select a college…" },
    ...colleges.map((c) => ({ value: c.code, label: `${c.short} — ${c.city}` })),
  ];

  const rows = useMemo(() => {
    if (!colA || !colB) return [];
    // PGCET publishes one round per programme (MBA ⇒ R2, MCA ⇒ R1), so a single
    // global round blanks whichever programme isn't in the picked round. When a
    // branch+category has just one round of data, show it regardless of the
    // picker; with multiple rounds (KCET) keep the exact-round match so we never
    // silently mix rounds.
    const pick = (col, branch) => {
      const rowsFor = col.cutoffs.filter(
        (r) => r.branch === branch && r.category === category
      );
      if (rowsFor.length <= 1) return rowsFor[0]?.closingRank ?? null;
      return rowsFor.find((r) => r.round === round)?.closingRank ?? null;
    };
    const branchCodes = [
      ...new Set([
        ...colA.cutoffs.map((r) => r.branch),
        ...colB.cutoffs.map((r) => r.branch),
      ]),
    ];
    return branchCodes
      .map((code) => {
        const name =
          taxonomy.branches.find((b) => b.code === code)?.name || code;
        return { code, name, a: pick(colA, code), b: pick(colB, code) };
      })
      .sort((x, y) => (x.a ?? Infinity) - (y.a ?? Infinity));
  }, [colA, colB, category, round, taxonomy]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <PickerCard label="College A" college={colA} basePath={basePath}>
          <Select
            aria-label="College A"
            value={colA?.code || ""}
            onChange={(v) => setPick("a", v)}
            options={collegeOptions}
          />
        </PickerCard>
        <PickerCard label="College B" college={colB} basePath={basePath}>
          <Select
            aria-label="College B"
            value={colB?.code || ""}
            onChange={(v) => setPick("b", v)}
            options={collegeOptions}
          />
        </PickerCard>
      </div>

      {!colA || !colB ? (
        <div className="glass rounded-3xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary/60">
            <GitCompareArrows className="size-7" />
          </div>
          <p className="mt-4 font-medium">Pick two colleges to compare their cutoffs.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <Select
                aria-label="Category"
                value={category}
                onChange={setCategory}
                className="w-56"
                options={taxonomy.categories.map((c) => ({
                  value: c.code,
                  label: `${c.code} — ${c.name}`,
                }))}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Round</span>
              <Select
                aria-label="Round"
                value={round}
                onChange={setRound}
                className="w-44"
                options={taxonomy.rounds.map((r) => ({ value: r.code, label: r.name }))}
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-center">{colA.short}</TableHead>
                  <TableHead className="text-center">{colB.short}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const aWins = r.a != null && (r.b == null || r.a < r.b);
                  const bWins = r.b != null && (r.a == null || r.b < r.a);
                  return (
                    <TableRow key={r.code}>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{r.code}</span>{" "}
                        <span className="text-sm">{r.name}</span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center font-mono",
                          aWins && "font-semibold text-primary"
                        )}
                      >
                        {formatRank(r.a)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center font-mono",
                          bWins && "font-semibold text-primary"
                        )}
                      >
                        {formatRank(r.b)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Lower closing rank (highlighted) = more competitive / higher demand.
          </p>
        </>
      )}
    </div>
  );
}

function PickerCard({ label, college, children, basePath = "" }) {
  return (
    <div className="glass rounded-2xl border border-border/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {college && (
          <Link
            href={`${basePath}/colleges/${college.code}`}
            className="text-xs text-primary hover:underline"
          >
            View →
          </Link>
        )}
      </div>
      {children}
      {college && (
        <p className="mt-2 text-xs text-muted-foreground">
          {college.name} · {college.type}
        </p>
      )}
    </div>
  );
}
