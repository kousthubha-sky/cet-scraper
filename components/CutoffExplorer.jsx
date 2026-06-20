"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

/**
 * Category + round switcher over a fixed set of cutoff rows.
 * groupBy="college" → branch page (rows across colleges for one branch)
 * groupBy="branch"  → college page (rows across branches for one college)
 */
export function CutoffExplorer({ rows, taxonomy, groupBy = "college", basePath = "", defaultRound = "R1" }) {
  const [category, setCategory] = useState("GM");
  // Round options come from the rounds actually present in these rows (a
  // programme/college may hold only some rounds), defaulting to the latest.
  const roundNum = (r) => parseInt(String(r).replace(/\D/g, ""), 10) || 0;
  const availableRounds = useMemo(() => {
    const codes = [...new Set(rows.map((r) => r.round))].sort((a, b) => roundNum(a) - roundNum(b));
    return codes.map((code) => ({
      code,
      name: taxonomy.rounds.find((r) => r.code === code)?.name || code,
    }));
  }, [rows, taxonomy]);
  const [round, setRound] = useState(
    availableRounds.some((r) => r.code === defaultRound)
      ? defaultRound
      : availableRounds.at(-1)?.code || defaultRound
  );

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => r.category === category && r.round === round)
        .sort((a, b) => a.closingRank - b.closingRank),
    [rows, category, round]
  );

  return (
    <div className="space-y-4">
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
            options={availableRounds.map((r) => ({ value: r.code, label: r.name }))}
          />
        </label>
        <span className="ml-auto self-center text-xs font-medium text-muted-foreground">
          {filtered.length} {groupBy === "college" ? "colleges" : "branches"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {groupBy === "college" ? (
                <>
                  <TableHead>College</TableHead>
                  <TableHead>Location</TableHead>
                </>
              ) : (
                <TableHead>Branch</TableHead>
              )}
              <TableHead className="text-right">Closing rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow
                key={groupBy === "college" ? r.collegeCode : r.branch}
                className="transition-colors hover:bg-secondary/30"
              >
                {groupBy === "college" ? (
                  <>
                    <TableCell>
                      <Link
                        href={`${basePath}/colleges/${r.collegeCode}`}
                        className="font-medium hover:text-primary"
                      >
                        {r.short}
                      </Link>
                      <div className="text-xs text-muted-foreground">{r.collegeName}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.city} · {r.collegeType}
                    </TableCell>
                  </>
                ) : (
                  <TableCell>
                    <Link
                      href={`${basePath}/branches/${r.branch}`}
                      className="hover:text-primary"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.branch}
                      </span>{" "}
                      <span className="text-sm">{r.branchName}</span>
                    </Link>
                  </TableCell>
                )}
                <TableCell className="text-right font-mono font-bold text-primary">
                  {formatRank(r.closingRank)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No data for this category/round combination.
          </p>
        )}
      </div>
    </div>
  );
}
