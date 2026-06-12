import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBranch, getTaxonomy, dataYear } from "@/lib/data";
import { CutoffExplorer } from "@/components/CutoffExplorer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getTaxonomy().branches.map((b) => ({ branch: b.code }));
}

export async function generateMetadata({ params }) {
  const { branch: code } = await params;
  const branch = getBranch(code);
  if (!branch) return {};
  const nColleges = new Set(branch.cutoffs.map((r) => r.collegeCode)).size;
  return {
    title: `${branch.name} — KCET 2025 Cutoffs by College`,
    description: `${nColleges} Karnataka engineering colleges offering ${branch.name}, with genuine KCET 2025 category-wise closing ranks (Rounds 1–3). Find colleges for your rank.`,
    alternates: { canonical: `/branches/${code}` },
  };
}

export default async function BranchPage({ params }) {
  const { branch: code } = await params;
  const branch = getBranch(code);
  if (!branch) notFound();
  const taxonomy = getTaxonomy();
  const year = dataYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Branches", item: `${SITE_URL}/branches` },
      { "@type": "ListItem", position: 3, name: branch.name, item: `${SITE_URL}/branches/${branch.code}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <Link
        href="/branches"
        className="pressable inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All branches
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{branch.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-mono">{branch.code}</span> · colleges offering this
          branch, by closing rank · {year} data
        </p>
      </div>

      <CutoffExplorer rows={branch.cutoffs} taxonomy={taxonomy} groupBy="college" />
    </div>
  );
}
