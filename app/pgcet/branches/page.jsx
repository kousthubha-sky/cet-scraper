import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPgcetCutoffs, getPgcetTaxonomy, pgcetDataYear, roundForBranch } from "@/lib/pgcet";
import { formatRank } from "@/lib/format";

export const metadata = {
  title: "PGCET Programmes — MBA & MCA Karnataka 2025 Cutoffs",
  description:
    "Browse Karnataka PGCET programmes — MBA and MCA — with the number of colleges and GM closing-rank range for each (genuine KEA 2025 cut-offs).",
  alternates: { canonical: "/pgcet/branches" },
};

export default function PgcetBranchesPage() {
  const taxonomy = getPgcetTaxonomy();
  const year = pgcetDataYear();
  const cutoffs = getPgcetCutoffs();

  const branches = taxonomy.branches
    .map((b) => {
      // each programme has its own published round (MBA→R2, MCA→R1)
      const round = roundForBranch(b.code);
      const br = cutoffs.filter(
        (r) => r.branch === b.code && r.category === "GM" && r.round === round
      );
      const ranks = br.map((r) => r.closingRank);
      return {
        ...b,
        round,
        roundName: taxonomy.coverage.find((c) => c.branch === b.code)?.roundName,
        colleges: br.length,
        best: ranks.length ? Math.min(...ranks) : null,
        worst: ranks.length ? Math.max(...ranks) : null,
      };
    })
    .sort((a, b) => (a.best ?? Infinity) - (b.best ?? Infinity));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">PGCET programmes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        GM closing-rank range per programme · {year} data. Open one to see every
        college and switch category/round.
      </p>

      <div className="mt-6 grid gap-3 stagger sm:grid-cols-2">
        {branches.map((b) => (
          <Link
            key={b.code}
            href={`/pgcet/branches/${b.code}`}
            className="group glass pressable flex items-center justify-between rounded-2xl border border-border/50 p-5 hover:border-primary/40 hover:shadow-ios"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{b.code}</span>
                <h2 className="text-lg font-bold">{b.name}</h2>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {b.colleges} colleges · {b.roundName} · GM cutoff {formatRank(b.best)} –{" "}
                {formatRank(b.worst)}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
