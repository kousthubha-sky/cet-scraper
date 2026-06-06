import { getColleges, getCollege, getTaxonomy } from "@/lib/data";
import { CompareView } from "@/components/CompareView";

export const metadata = {
  title: "Compare colleges",
  description:
    "Compare two Karnataka engineering colleges side by side on KCET closing ranks and fees, branch by branch.",
};

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  const colleges = getColleges();
  const colA = sp.a ? getCollege(sp.a) : null;
  const colB = sp.b ? getCollege(sp.b) : null;
  const taxonomy = getTaxonomy();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Compare colleges</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Two colleges, side by side — cutoffs by branch for any category and round.
      </p>
      <CompareView
        colleges={colleges}
        colA={colA}
        colB={colB}
        taxonomy={taxonomy}
      />
    </div>
  );
}
