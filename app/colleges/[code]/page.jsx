import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { getCollege, getColleges, getTaxonomy, dataYear } from "@/lib/data";
import { CutoffExplorer } from "@/components/CutoffExplorer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getColleges().map((c) => ({ code: c.code }));
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const college = getCollege(code);
  if (!college) return {};
  const nBranches = new Set(college.cutoffs.map((r) => r.branch)).size;
  return {
    title: `${college.name} — KCET 2025 Cutoffs & Branches`,
    description: `${college.name} (${college.city}): KCET 2025 closing ranks across ${nBranches} branches by category and round (Rounds 1–3). Check if your KCET rank can get you in.`,
    alternates: { canonical: `/colleges/${code}` },
  };
}

export default async function CollegePage({ params }) {
  const { code } = await params;
  const college = getCollege(code);
  if (!college) notFound();
  const taxonomy = getTaxonomy();
  const year = dataYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Colleges", item: `${SITE_URL}/colleges` },
          { "@type": "ListItem", position: 3, name: college.name, item: `${SITE_URL}/colleges/${college.code}` },
        ],
      },
      {
        "@type": "CollegeOrUniversity",
        name: college.name,
        url: `${SITE_URL}/colleges/${college.code}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: college.city,
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <Link
        href="/colleges"
        className="pressable inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All colleges
      </Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{college.short}</h1>
          <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {college.code}
          </span>
        </div>
        <p className="mt-1.5 text-muted-foreground">{college.name}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="glass inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5">
            <MapPin className="size-4 text-primary" /> {college.city}
          </span>
          <span className="glass inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5">
            <Building2 className="size-4 text-primary" /> {college.type}
          </span>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Branch-wise cutoffs · {year}
      </h2>
      <CutoffExplorer rows={college.cutoffs} taxonomy={taxonomy} groupBy="branch" />
    </div>
  );
}
