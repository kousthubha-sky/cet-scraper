import { getPgcetColleges, getPgcetCollege, getPgcetTaxonomy } from "@/lib/pgcet";
import { CompareView } from "@/components/CompareView";

export const metadata = {
  title: "Compare PGCET Colleges Side by Side — MBA & MCA",
  description:
    "Compare two Karnataka PGCET colleges side by side on genuine 2025 closing ranks, by category and round.",
  alternates: { canonical: "/pgcet/compare" },
};

export default async function PgcetComparePage({ searchParams }) {
  const sp = await searchParams;
  const colleges = getPgcetColleges();
  const colA = sp.a ? getPgcetCollege(sp.a) : null;
  const colB = sp.b ? getPgcetCollege(sp.b) : null;
  const taxonomy = getPgcetTaxonomy();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Compare PGCET colleges</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Two colleges, side by side — PGCET cut-offs for any category and round.
      </p>
      <CompareView
        colleges={colleges}
        colA={colA}
        colB={colB}
        taxonomy={taxonomy}
        basePath="/pgcet"
      />
    </div>
  );
}
