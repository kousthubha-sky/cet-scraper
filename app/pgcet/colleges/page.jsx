import { getPgcetColleges, getPgcetTaxonomy } from "@/lib/pgcet";
import { CollegeSearch } from "@/components/CollegeSearch";

export const metadata = {
  title: "PGCET MBA & MCA Colleges — Karnataka 2025 Cutoffs",
  description:
    "Search and browse Karnataka PGCET colleges for MBA and MCA. Open any college to see its category-wise PGCET 2025 closing ranks.",
  alternates: { canonical: "/pgcet/colleges" },
};

export default function PgcetCollegesPage() {
  const colleges = getPgcetColleges();
  const taxonomy = getPgcetTaxonomy();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">PGCET colleges</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {colleges.length} Karnataka PGCET colleges (MBA & MCA). Open one for
        category-wise cut-offs.
      </p>
      <CollegeSearch
        colleges={colleges}
        cities={taxonomy.cities}
        types={taxonomy.collegeTypes}
        basePath="/pgcet"
      />
    </div>
  );
}
