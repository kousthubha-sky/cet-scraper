import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPgcetBranch, getPgcetTaxonomy, pgcetDataYear, roundForBranch } from "@/lib/pgcet";
import { CutoffExplorer } from "@/components/CutoffExplorer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getPgcetTaxonomy().branches.map((b) => ({ branch: b.code }));
}

export async function generateMetadata({ params }) {
  const { branch: code } = await params;
  const branch = getPgcetBranch(code);
  if (!branch) return {};
  const nColleges = new Set(branch.cutoffs.map((r) => r.collegeCode)).size;
  return {
    title: `PGCET ${branch.code} (${branch.name}) — 2025 Cutoffs by College`,
    description: `${nColleges} Karnataka colleges offering PGCET ${branch.name}, with genuine 2025 category-wise closing ranks. Find colleges for your rank.`,
    alternates: { canonical: `/pgcet/branches/${code}` },
  };
}

export default async function PgcetBranchPage({ params }) {
  const { branch: code } = await params;
  const branch = getPgcetBranch(code);
  if (!branch) notFound();
  const taxonomy = getPgcetTaxonomy();
  const year = pgcetDataYear();
  const defaultRound = roundForBranch(code) || "R1";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "PGCET", item: `${SITE_URL}/pgcet` },
      { "@type": "ListItem", position: 2, name: "Programmes", item: `${SITE_URL}/pgcet/branches` },
      { "@type": "ListItem", position: 3, name: branch.name, item: `${SITE_URL}/pgcet/branches/${branch.code}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <Link
        href="/pgcet/branches"
        className="pressable inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All programmes
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{branch.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-mono">{branch.code}</span> · colleges offering this
          programme, by closing rank · {year} data
        </p>
      </div>

      <CutoffExplorer
        rows={branch.cutoffs}
        taxonomy={taxonomy}
        groupBy="college"
        basePath="/pgcet"
        defaultRound={defaultRound}
      />
    </div>
  );
}
