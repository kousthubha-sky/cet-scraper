import Link from "next/link";
import {
  Compass,
  Building2,
  GitCompareArrows,
  ArrowUpRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { getTaxonomy, getColleges, dataYear } from "@/lib/data";
import { PredictForm } from "@/components/PredictForm";

export default function HomePage() {
  const taxonomy = getTaxonomy();
  const colleges = getColleges();
  const year = dataYear();
  const popular = taxonomy.branches.slice(0, 8);
  const marquee = [...colleges, ...colleges];

  const stats = [
    { value: colleges.length, label: "Colleges" },
    { value: taxonomy.branches.length, label: "Branches" },
    { value: taxonomy.categories.length, label: "Categories" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-2xl px-6 pt-14 pb-8 text-center sm:pt-20">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-gradient">
          KCET {year} · College Finder
        </span>

        <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Got your rank?
          <br />
          Find{" "}
          <span className="font-serif font-normal italic">your college.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Enter your KCET rank — or just your application number — and instantly
          see every Karnataka engineering college within reach, sorted{" "}
          <span className="font-medium text-foreground">
            Safe → Target → Reach
          </span>
          .
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6">
        <PredictForm taxonomy={taxonomy} />

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
          Based on {year} closing ranks · always verify on the official KEA site
        </p>
      </section>

      {/* ── Marquee of colleges ── */}
      <section className="relative mt-16 mb-4 sm:mt-20">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="flex w-max animate-marquee gap-3">
          {marquee.map((c, i) => (
            <span
              key={`${c.code}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm"
            >
              <span className="size-1.5 rounded-full bg-[var(--grad-violet)]" />
              {c.short}
              <span className="text-muted-foreground">· {c.city}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-gradient">
          Explore
        </h2>
        <p className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Three ways to find your <span className="font-serif font-normal italic">fit</span>
        </p>

        <div className="grid gap-6 stagger sm:grid-cols-3">
          <FeatureCard
            href="/branches"
            grad="grad-card-1"
            icon={Compass}
            title="Explore by branch"
            desc="CSE, ECE, AI/ML & more — every college that offers it, with cutoff ranges."
          >
            <div className="flex flex-wrap gap-2">
              {popular.slice(0, 4).map((b) => (
                <span
                  key={b.code}
                  className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-[#1e293b] shadow-sm"
                >
                  {b.code}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            href="/colleges"
            grad="grad-card-2"
            icon={Building2}
            title="Search colleges"
            desc="Look up any college — all branches, category-wise cutoffs and fees."
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-medium text-[#1e293b] shadow-sm">
              <Search className="size-3.5 text-muted-foreground" />
              Search 27 colleges…
            </span>
          </FeatureCard>

          <FeatureCard
            href="/compare"
            grad="grad-card-3"
            icon={GitCompareArrows}
            title="Compare colleges"
            desc="Put two colleges side by side on cutoffs and fees before you decide."
          >
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm">
                {colleges[0]?.short}
              </span>
              <span className="text-xs font-bold text-[#1e293b]/60">vs</span>
              <span className="rounded-xl border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm">
                {colleges[4]?.short}
              </span>
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* ── Popular branches ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-[28px] border border-border bg-card-soft p-6 shadow-ios sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Popular branches
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {popular.map((b) => (
              <Link
                key={b.code}
                href={`/branches/${b.code}`}
                className="pressable rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:border-accent/40 hover:text-accent"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ href, grad, icon: Icon, title, desc, children }) {
  return (
    <Link
      href={href}
      className={`group pressable relative flex h-[340px] flex-col justify-end overflow-hidden rounded-[28px] p-6 text-left shadow-ios ${grad}`}
    >
      {/* floating visual near the top */}
      <div className="absolute inset-x-6 top-7 flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-white/90 text-[#051A24] shadow-sm">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-[#1e293b]/50 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <div className="absolute inset-x-6 top-24">{children}</div>

      <h3 className="text-lg font-semibold text-[#1e293b]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#1e293b]/70">{desc}</p>
    </Link>
  );
}
