import { getCutoffs, getTaxonomy, dataYear } from "@/lib/data";
import { predict, summarize } from "@/lib/eligibility";
import { PredictForm } from "@/components/PredictForm";
import { PredictResults } from "@/components/PredictResults";
import { ordinal } from "@/lib/format";

export const metadata = {
  title: "KCET College Predictor — Colleges by Your Rank",
  description:
    "Enter your KCET rank and category to see Karnataka engineering colleges and branches you can realistically get, classified Safe, Target and Reach (KEA 2025 cutoffs).",
  alternates: { canonical: "/predict" },
};

export default async function PredictPage({ searchParams }) {
  const sp = await searchParams;
  const taxonomy = getTaxonomy();
  const year = dataYear();

  const rank = parseInt(sp.rank, 10) || null;
  const category = sp.category || "GM";
  const round = sp.round || taxonomy.rounds[0]?.code || "R2";

  const matches = rank
    ? predict(getCutoffs(), { rank, category, round })
    : [];
  const summary = summarize(matches);
  const catName =
    taxonomy.categories.find((c) => c.code === category)?.name || category;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          College predictor
        </h1>
        {rank ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Showing colleges for rank{" "}
            <span className="font-semibold text-foreground">{ordinal(rank)}</span>{" "}
            · {category} ({catName}) ·{" "}
            {taxonomy.rounds.find((r) => r.code === round)?.name} · {year} cutoffs
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your rank to see colleges within reach.
          </p>
        )}
      </div>

      <PredictForm
        taxonomy={taxonomy}
        compact
        defaults={{ rank: rank || "", category, round }}
      />

      <div className="mt-8">
        {rank ? (
          <PredictResults
            matches={matches}
            summary={summary}
            taxonomy={taxonomy}
          />
        ) : (
          <div className="glass rounded-3xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
            Your matching colleges will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
