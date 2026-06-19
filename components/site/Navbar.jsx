"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Target,
  Compass,
  Building2,
  GitCompareArrows,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Section links per mode. `seg` is the shared path segment; href is prefixed
// with /pgcet in PGCET mode. Only the Branches label differs (Programmes).
const KCET_LINKS = [
  { seg: "predict", label: "Predict", icon: Target },
  { seg: "branches", label: "Branches", icon: Compass },
  { seg: "colleges", label: "Colleges", icon: Building2 },
  { seg: "compare", label: "Compare", icon: GitCompareArrows },
];
const PGCET_LINKS = [
  { seg: "predict", label: "Predict", icon: Target },
  { seg: "branches", label: "Programmes", icon: Briefcase },
  { seg: "colleges", label: "Colleges", icon: Building2 },
  { seg: "compare", label: "Compare", icon: GitCompareArrows },
];

const SECTIONS = new Set(["predict", "branches", "colleges", "compare"]);

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(href + "/");
}

// The same section in the other mode — keeps context when toggling (a detail
// page falls back to its section list; home/other → the mode's home).
function counterpart(pathname, toPgcet) {
  const kcetPath = pathname.replace(/^\/pgcet/, "") || "/";
  const seg = kcetPath.split("/")[1] || "";
  const section = SECTIONS.has(seg) ? `/${seg}` : "";
  return toPgcet ? `/pgcet${section}` : section || "/";
}

export function Navbar() {
  const pathname = usePathname();
  const pgcet = pathname === "/pgcet" || pathname.startsWith("/pgcet/");
  const base = pgcet ? "/pgcet" : "";
  const links = pgcet ? PGCET_LINKS : KCET_LINKS;

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 rounded-2xl bg-white/75 px-4 backdrop-blur-3xl sm:px-6">
          <Link
            href={pgcet ? "/pgcet" : "/"}
            className="pressable flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-[var(--grad-orange)] via-[var(--grad-coral)] to-[var(--grad-violet)] text-white shadow-sm">
              <GraduationCap className="size-5" />
            </span>
            <span className="hidden text-[1.05rem] sm:inline">
              {pgcet ? "PGCET" : "KCET"}
              <span className="text-gradient"> Finder</span>
            </span>
          </Link>

          {/* Desktop pill nav */}
          <nav className="hidden items-center gap-1 rounded-2xl border border-border bg-secondary/60 p-1 sm:flex">
            {links.map((l) => {
              const href = `${base}/${l.seg}`;
              const active = isActive(pathname, href);
              return (
                <Link
                  key={l.seg}
                  href={href}
                  className={cn(
                    "pressable rounded-xl px-4 py-1.5 text-sm font-medium",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* KCET ⇄ PGCET mode toggle */}
          <div className="flex shrink-0 rounded-full border border-border bg-secondary/60 p-0.5 text-xs font-semibold">
            <Link
              href={counterpart(pathname, false)}
              aria-current={!pgcet ? "page" : undefined}
              className={cn(
                "pressable rounded-full px-3 py-1.5",
                !pgcet ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              KCET
            </Link>
            <Link
              href={counterpart(pathname, true)}
              aria-current={pgcet ? "page" : undefined}
              className={cn(
                "pressable rounded-full px-3 py-1.5",
                pgcet ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              PGCET
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map((l) => {
            const href = `${base}/${l.seg}`;
            const active = isActive(pathname, href);
            const Icon = l.icon;
            return (
              <Link
                key={l.seg}
                href={href}
                className={cn(
                  "pressable flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium",
                  active ? "text-accent" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl transition-colors",
                    active && "bg-accent/12"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
