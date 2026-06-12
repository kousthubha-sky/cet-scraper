import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCutoffs, getTaxonomy, dataYear } from "@/lib/data";
import { formatRank } from "@/lib/format";

export const metadata = {
  title: "KCET Engineering Branches & 2025 Cutoffs",
  description:
    "Browse all KCET engineering branches — CSE, ECE, AI/ML, Mechanical and more — with the number of colleges and GM closing-rank range for each (KEA 2025).",
  alternates: { canonical: "/branches" },
};

export default function BranchesPage() {
  const taxonomy = getTaxonomy();
  const year = dataYear();
  const rows = getCutoffs().filter((r) => r.category === "GM" && r.round === "R1");

  const branches = taxonomy.branches
    .map((b) => {
      const br = rows.filter((r) => r.branch === b.code);
      const ranks = br.map((r) => r.closingRank);
      return {
        ...b,
        colleges: br.length,
        best: ranks.length ? Math.min(...ranks) : null,
        worst: ranks.length ? Math.max(...ranks) : null,
      };
    })
    .sort((a, b) => (a.best ?? Infinity) - (b.best ?? Infinity));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Branches</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        GM Round-1 cutoff range per branch · {year} data. Open a branch to see
        every college and switch category/round.
      </p>

      <div className="mt-6 grid gap-3 stagger sm:grid-cols-2">
        {branches.map((b) => (
          <Link
            key={b.code}
            href={`/branches/${b.code}`}
            className="group glass pressable flex items-center justify-between rounded-2xl border border-border/50 p-5 hover:border-primary/40 hover:shadow-ios"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{b.code}</span>
                <h2 className="text-lg font-bold">{b.name}</h2>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {b.colleges} colleges · GM cutoff {formatRank(b.best)} –{" "}
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
