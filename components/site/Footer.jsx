import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card-soft">
      {/* Extra bottom padding on mobile clears the fixed bottom tab bar (its
          height + safe-area inset) so the disclaimer + copyright aren't hidden
          behind it; normal padding on sm+ where the bar is gone. */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] text-sm text-muted-foreground sm:px-6 sm:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md">
            KCET College Finder — a free tool to explore Karnataka engineering
            admissions by rank, branch and cutoff. <br />
            Made by{" "}
            <a
              href="https://kousthubha.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline decoration-from-font underline-offset-2 hover:text-accent"
            >
              kousthubha.me
            </a>
            <br /> Data sourced from official KEA results.
          </p>
          <nav className="flex gap-5 font-medium">
            <Link href="/predict" className="pressable hover:text-foreground">Predict</Link>
            <Link href="/branches" className="pressable hover:text-foreground">Branches</Link>
            <Link href="/colleges" className="pressable hover:text-foreground">Colleges</Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/70">
          Cutoffs are KEA&apos;s published KCET-2025 round-wise closing ranks
          (Rounds 1–3, Rest of Karnataka), shown for guidance only. Always
          verify against official KEA results at cetonline.karnataka.gov.in
          before making admission decisions.
        </p>
        <p className="mt-3 text-xs text-muted-foreground/60">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://kousthubha.me"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            kousthubha.me
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
