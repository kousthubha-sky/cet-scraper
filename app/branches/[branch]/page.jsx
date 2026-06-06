import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBranch, getTaxonomy, dataYear } from "@/lib/data";
import { CutoffExplorer } from "@/components/CutoffExplorer";

export function generateStaticParams() {
  return getTaxonomy().branches.map((b) => ({ branch: b.code }));
}

export async function generateMetadata({ params }) {
  const { branch: code } = await params;
  const branch = getBranch(code);
  if (!branch) return {};
  return {
    title: `${branch.name} — KCET colleges & cutoffs`,
    description: `Karnataka engineering colleges offering ${branch.name} with category-wise KCET closing ranks and fees.`,
  };
}

export default async function BranchPage({ params }) {
  const { branch: code } = await params;
  const branch = getBranch(code);
  if (!branch) notFound();
  const taxonomy = getTaxonomy();
  const year = dataYear();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
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
