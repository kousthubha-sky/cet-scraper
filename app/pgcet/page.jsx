import Link from "next/link";
import { Compass, Building2, GitCompareArrows, Target, ShieldCheck } from "lucide-react";
import { getPgcetTaxonomy, getPgcetColleges, pgcetDataYear } from "@/lib/pgcet";
import { PgcetForm } from "@/components/PgcetForm";

export const metadata = {
  title: "PGCET College Finder 2025 — Predict MBA & MCA Colleges by Rank",
  description:
    "Free Karnataka PGCET college predictor. Enter your PGCET-2025 rank or marks to find MBA and MCA colleges you can get, with genuine KEA round-wise closing ranks, programme explorer and side-by-side compare.",
  alternates: { canonical: "/pgcet" },
};

export default function PgcetHome() {
  const taxonomy = getPgcetTaxonomy();
  const colleges = getPgcetColleges();
  const year = pgcetDataYear();

  const stats = [
    { value: colleges.length, label: "Colleges" },
    { value: taxonomy.branches.length, label: "Programmes" },
    { value: taxonomy.categories.length, label: "Categories" },
  ];

  const cards = [
    { href: "/pgcet/predict", icon: Target, title: "Predict by rank or marks", desc: "Enter your PGCET rank — or just your marks — and see MBA/MCA colleges within reach, Safe → Target → Reach." },
    { href: "/pgcet/branches", icon: Compass, title: "MBA & MCA", desc: "Browse each programme — every college that offers it, with closing-rank ranges." },
    { href: "/pgcet/colleges", icon: Building2, title: "Search colleges", desc: `Look up any of ${colleges.length} PGCET colleges — category-wise closing ranks.` },
    { href: "/pgcet/compare", icon: GitCompareArrows, title: "Compare colleges", desc: "Put two PGCET colleges side by side on closing ranks before you decide." },
  ];

  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto max-w-2xl px-6 pt-14 pb-8 text-center sm:pt-20">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-gradient">
          PGCET 2025 · MBA & MCA
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
    </div>
  );
}
