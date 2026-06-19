import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { getPgcetCollege, getPgcetColleges, getPgcetTaxonomy, pgcetDataYear, roundForBranch } from "@/lib/pgcet";
import { CutoffExplorer } from "@/components/CutoffExplorer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getPgcetColleges().map((c) => ({ code: c.code }));
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const college = getPgcetCollege(code);
  if (!college) return {};
  return {
    title: `${college.name} — PGCET ${college.branch} 2025 Cutoffs`,
    description: `${college.name} (${college.city}): PGCET 2026 ${college.branch} closing ranks by category. Check if your PGCET rank can get you in.`,
    alternates: { canonical: `/pgcet/colleges/${code}` },
  };
}

export default async function PgcetCollegePage({ params }) {
  const { code } = await params;
  const college = getPgcetCollege(code);
  if (!college) notFound();
  const taxonomy = getPgcetTaxonomy();
  const year = pgcetDataYear();
  const defaultRound = roundForBranch(college.branch) || "R1";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PGCET", item: `${SITE_URL}/pgcet` },
          { "@type": "ListItem", position: 2, name: "Colleges", item: `${SITE_URL}/pgcet/colleges` },
          { "@type": "ListItem", position: 3, name: college.name, item: `${SITE_URL}/pgcet/colleges/${college.code}` },
        ],
      },
      {
        "@type": "CollegeOrUniversity",
        name: college.name,
        url: `${SITE_URL}/pgcet/colleges/${college.code}`,
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
        href="/pgcet/colleges"
        className="pressable inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All PGCET colleges
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
          <span className="glass inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5">
            {college.branch}
          </span>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Category-wise cut-offs · {year}
      </h2>
      <CutoffExplorer
        rows={college.cutoffs}
        taxonomy={taxonomy}
        groupBy="branch"
        basePath="/pgcet"
        defaultRound={defaultRound}
      />
    </div>
  );
}
