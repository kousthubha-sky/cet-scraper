"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Target,
  Compass,
  Building2,
  GitCompareArrows,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/branches", label: "Branches", icon: Compass },
  { href: "/colleges", label: "Colleges", icon: Building2 },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
];

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-3xl bg-white/75 backdrop-blur-3xl rounded-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="pressable flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-[var(--grad-orange)] via-[var(--grad-coral)] to-[var(--grad-violet)] text-white shadow-sm">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-[1.05rem]">
              KCET<span className="text-gradient"> Finder</span>
            </span>
          </Link>

          {/* Desktop pill nav */}
          <nav className="hidden items-center gap-1 rounded-2xl border border-border bg-secondary/60 p-1 sm:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
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

          {/* Mobile CTA */}
          <Link
            href="/predict"
            className="pressable btn-shadow-primary rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground sm:hidden"
          >
            Predict
          </Link>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
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
