import { getPgcetCutoffs, getPgcetTaxonomy, roundForBranch, pgcetDataYear } from "@/lib/pgcet";
import { predict, summarize } from "@/lib/eligibility";
import { estimateRankFromMarks } from "@/lib/pgcet-marks";
import { PgcetForm } from "@/components/PgcetForm";
import { PredictResults } from "@/components/PredictResults";
import { formatRank, ordinal } from "@/lib/format";

export const metadata = {
  title: "PGCET College Predictor 2025 — MBA & MCA by Your Rank or Marks",
  description:
    "Enter your Karnataka PGCET-2025 rank (or marks) to see the MBA and MCA colleges you can get, classified Safe, Target and Reach. Genuine KEA round-wise allotment cut-off ranks — MBA Round 2, MCA Round 1.",
  alternates: { canonical: "/pgcet/predict" },
};

export default async function PgcetPredictPage({ searchParams }) {
  const sp = await searchParams;
  const taxonomy = getPgcetTaxonomy();
  const year = pgcetDataYear();
  const branchCodes = taxonomy.branches.map((b) => b.code);

  const branch = branchCodes.includes(sp.branch) ? sp.branch : branchCodes[0];
  const category = taxonomy.categories.some((c) => c.code === sp.category) ? sp.category : "GM";
  const round = taxonomy.rounds.some((r) => r.code === sp.round) ? sp.round : roundForBranch(branch);
  const roundName = taxonomy.rounds.find((r) => r.code === round)?.name || round;
  const catName = taxonomy.categories.find((c) => c.code === category)?.name || category;

  const rankInput = parseInt(sp.rank, 10) || null;
  const marksInput = !rankInput ? parseInt(sp.marks, 10) || null : null;
  const estimatedRank = marksInput ? estimateRankFromMarks(marksInput, branch) : null;
  const rank = rankInput || estimatedRank;
  const isEstimate = !rankInput && estimatedRank != null;

  const branchRows = getPgcetCutoffs().filter((r) => r.branch === branch);
  const matches = rank ? predict(branchRows, { rank, category, round }) : [];
  const summary = rank ? summarize(matches) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-gradient">
          PGCET 2025 · Karnataka
        </span>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          PGCET college predictor
        </h1>
        {rank ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {branch} colleges for {isEstimate ? "an estimated rank " : "rank "}
            <span className="font-semibold text-foreground">
              {isEstimate ? "≈ " : ""}
              {ordinal(rank)}
            </span>
            {isEstimate ? ` (from ${marksInput} marks)` : ""} · {category} ({catName}) ·{" "}
            {roundName} · {year} cut-offs
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your rank or marks to see colleges within reach.
          </p>
        )}
      </div>

      <PgcetForm
        taxonomy={taxonomy}
        defaults={{ branch, round, category, rank: rankInput || "", marks: marksInput || "" }}
      />

      {isEstimate && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Estimated rank <span className="font-semibold">≈ {formatRank(estimatedRank)}</span> from{" "}
          <span className="font-semibold">{marksInput}</span> marks ({branch}). Rough estimate from
          candidate-reported data{branch === "MBA" ? " (only 2 MBA data points)" : ""} — not an
          official KEA rank, so treat the colleges below as indicative.
        </div>
      )}

      <div className="mt-8">
        {rank ? (
          <PredictResults matches={matches} summary={summary} taxonomy={taxonomy} basePath="/pgcet" />
        ) : (
          <div className="glass rounded-3xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
            Your matching {branch} colleges will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
