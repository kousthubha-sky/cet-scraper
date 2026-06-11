import { getCutoffs, getTaxonomy, dataYear } from "@/lib/data";
import { predict, summarize } from "@/lib/eligibility";
import { PredictForm } from "@/components/PredictForm";
import { PredictResults } from "@/components/PredictResults";
import { ordinal } from "@/lib/format";

export const metadata = {
  title: "Predict your colleges by KCET rank",
  description:
    "Enter your KCET rank and category to see Karnataka engineering colleges and branches you can realistically get, classified Safe, Target and Reach.",
};

export default async function PredictPage({ searchParams }) {
  const sp = await searchParams;
  const taxonomy = getTaxonomy();
  const year = dataYear();

  const rank = parseInt(sp.rank, 10) || null;
  const category = sp.category || "GM";
  const round = sp.round || "R1";

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

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <p>
          <b>
            The entire {year} dataset here is indicative sample data, not
            official KEA results.
          </b>{" "}
          Every closing rank is estimated by a formula, and each college&apos;s
          branch list is generated heuristically — so ranks can be off and
          colleges may show branches they don&apos;t offer (or miss ones they
          do). Use this only to explore — always confirm on the{" "}
          <a
            href="https://cetonline.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            official KEA site
          </a>{" "}
          before making any decision.
        </p>
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
