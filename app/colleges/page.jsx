import { getColleges, getTaxonomy } from "@/lib/data";
import { CollegeSearch } from "@/components/CollegeSearch";

export const metadata = {
  title: "Search Karnataka engineering colleges",
  description:
    "Search and browse Karnataka engineering colleges. Open any college to see all branches, category-wise KCET cutoffs and fees.",
};

export default function CollegesPage() {
  const colleges = getColleges();
  const taxonomy = getTaxonomy();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Colleges</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {colleges.length} Karnataka engineering colleges. Open one for branch-wise
        cutoffs and fees.
      </p>
      <CollegeSearch
        colleges={colleges}
        cities={taxonomy.cities}
        types={taxonomy.collegeTypes}
      />
    </div>
  );
}
