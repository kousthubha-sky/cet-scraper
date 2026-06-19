import Link from "next/link";
import { Compass, Building2, GitCompareArrows, Target, ShieldCheck } from "lucide-react";
import { getPgcetTaxonomy, getPgcetColleges, getPgcetCutoffs, pgcetDataYear } from "@/lib/pgcet";
import { PgcetForm } from "@/components/PgcetForm";
import { JsonLd } from "@/components/JsonLd";
import { formatRank } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "PGCET College Finder 2026 — Predict MBA & MCA Colleges by Rank or Marks",
  description:
    "Free Karnataka PGCET 2026 college predictor. Enter your PGCET rank or marks to find MBA and MCA colleges you can get — genuine KEA round-wise closing ranks (MBA Round 2, MCA Round 1, Rest of Karnataka), programme explorer and side-by-side compare.",
  keywords: [
    "PGCET 2026 cutoff",
    "PGCET 2026 cutoff rank",
    "Karnataka PGCET",
    "PGCET MBA cutoff 2025",
    "PGCET MCA cutoff 2025",
    "PGCET college predictor",
    "PGCET rank predictor",
    "PGCET marks vs rank",
    "KEA PGCET 2026",
    "PGCET MBA colleges Karnataka",
    "PGCET MCA colleges Karnataka",
    "Karnataka PGCET college finder",
    "PGCET option entry colleges",
  ],
  alternates: { canonical: "/pgcet" },
  openGraph: {
    title: "PGCET College Finder 2026 — MBA & MCA Colleges by Rank",
    description:
      "Predict Karnataka PGCET MBA & MCA colleges by your rank or marks — genuine KEA 2025 closing ranks, Safe/Target/Reach.",
    url: "/pgcet",
    type: "website",
  },
};

export default function PgcetHome() {
  const taxonomy = getPgcetTaxonomy();
  const colleges = getPgcetColleges();
  const cutoffs = getPgcetCutoffs();
  const year = pgcetDataYear();

  const stats = [
    { value: colleges.length, label: "Colleges" },
    { value: taxonomy.branches.length, label: "Programmes" },
    { value: taxonomy.categories.length, label: "Categories" },
  ];

  // Real General-Merit closing-rank ranges, so the copy + FAQ state genuine
  // numbers (good for both search snippets and AI answer-engine citation).
  const gmRange = (branch, round) => {
    const r = cutoffs
      .filter((c) => c.branch === branch && c.category === "GM" && c.round === round)
      .map((c) => c.closingRank);
    return r.length ? { best: Math.min(...r), worst: Math.max(...r) } : null;
  };
  const mba = gmRange("MBA", "R2");
  const mca = gmRange("MCA", "R1");

  const cards = [
    { href: "/pgcet/predict", icon: Target, title: "Predict by rank or marks", desc: "Enter your PGCET rank — or just your marks — and see MBA/MCA colleges within reach, Safe → Target → Reach." },
    { href: "/pgcet/branches", icon: Compass, title: "MBA & MCA", desc: "Browse each programme — every college that offers it, with closing-rank ranges." },
    { href: "/pgcet/colleges", icon: Building2, title: "Search colleges", desc: `Look up any of ${colleges.length} PGCET colleges — category-wise closing ranks.` },
    { href: "/pgcet/compare", icon: GitCompareArrows, title: "Compare colleges", desc: "Put two PGCET colleges side by side on closing ranks before you decide." },
  ];

  const faqs = [
    {
      q: "What is Karnataka PGCET?",
      a: "PGCET (Post Graduate Common Entrance Test) is conducted by the Karnataka Examinations Authority (KEA) for admission to MBA, MCA, M.Tech and M.E. programmes in Karnataka. This finder covers MBA and MCA using KEA's genuine 2025 round-wise allotment cut-off ranks.",
    },
    {
      q: `What were the PGCET ${year} cutoffs for MBA and MCA?`,
      a: `Genuine KEA closing ranks (General Merit, Rest of Karnataka): MBA Round 2 ranged from about ${formatRank(mba?.best)} (most competitive) to ${formatRank(mba?.worst)}, and MCA Round 1 from about ${formatRank(mca?.best)} to ${formatRank(mca?.worst)}, across ${colleges.length} colleges. Open the predictor or a programme page for exact category-wise ranks.`,
    },
    {
      q: "How do I predict my PGCET college by rank — or by marks?",
      a: "Enter your PGCET rank and category to instantly list MBA or MCA colleges within reach, classified Safe, Target and Reach against KEA's 2025 closing ranks. Don't know your rank yet? Enter your marks instead and we estimate a rank first.",
    },
    {
      q: "What PGCET marks or rank do I need for a top MBA or MCA college?",
      a: "It varies by college and category, but PGCET is scored to about 75, so 60+ marks usually means a top-few-hundred rank, and the most competitive Bangalore colleges close General Merit within the low hundreds to low thousands. Use the predictor for your exact rank.",
    },
    {
      q: "Is this PGCET cutoff data official?",
      a: "The closing ranks are KEA's published PGCET-2025 round-wise allotment cut-offs (Rest of Karnataka) — MBA Round 2 and MCA Round 1. The optional marks-to-rank figure is an approximate, candidate-reported estimate. Always verify on the official KEA site (cetonline.karnataka.gov.in) before option entry.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "PGCET", item: `${SITE_URL}/pgcet` },
    ],
  };

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="mx-auto max-w-2xl px-6 pt-14 pb-8 text-center sm:pt-20">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-gradient">
          PGCET 2026 · MBA & MCA
        </span>
        <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Got your PGCET rank?
          <br />
          Find <span className="font-serif font-normal italic">your college.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Enter your PGCET rank or marks — and instantly see every Karnataka MBA &
          MCA college within reach, sorted{" "}
          <span className="font-medium text-foreground">Safe → Target → Reach</span>.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6">
        <PgcetForm taxonomy={taxonomy} />

        <div className="mt-5 flex items-center justify-center gap-2 stagger sm:gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl border border-border bg-card-soft px-3 py-3 text-center shadow-sm"
            >
              <div className="text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" />
          Genuine KEA {year} cut-offs · MBA Round 2 · MCA Round 1 · always verify on KEA
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-gradient">
          Explore
        </h2>
        <p className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Everything from KCET, now for <span className="font-serif font-normal italic">PGCET</span>
        </p>

        <div className="grid gap-4 stagger sm:grid-cols-2">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group glass pressable rounded-2xl border border-border/50 p-6 hover:border-primary/40 hover:shadow-ios"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary/60 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight group-hover:text-primary">{c.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About — factual entity context for search + AI answer engines */}
      <section className="mx-auto max-w-3xl px-6 pb-4">
        <div className="rounded-[28px] border border-border bg-card-soft p-6 text-sm leading-relaxed text-muted-foreground shadow-ios sm:p-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            About Karnataka PGCET {year}
          </h2>
          <p>
            <strong className="text-foreground">PGCET</strong> (Post Graduate Common Entrance Test),
            conducted by the <strong className="text-foreground">Karnataka Examinations Authority
            (KEA)</strong>, is the entrance exam for MBA, MCA and M.Tech admissions in Karnataka.
            This finder covers <strong className="text-foreground">MBA and MCA</strong> across{" "}
            {colleges.length} colleges, using KEA&apos;s genuine {year} round-wise allotment cut-off
            ranks (Rest of Karnataka) — MBA Round 2 and MCA Round 1. Enter a rank for an exact match,
            or marks for an estimate, and sort colleges Safe, Target and Reach.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-6">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-gradient">
          FAQ
        </h2>
        <p className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          PGCET college finder{" "}
          <span className="font-serif font-normal italic">questions</span>
        </p>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-card-soft p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {f.q}
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
