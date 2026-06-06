import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card-soft">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md">
            KCET College Finder — a free tool to explore Karnataka engineering
            admissions by rank, branch and cutoff.
          </p>
          <nav className="flex gap-5 font-medium">
            <Link href="/predict" className="pressable hover:text-foreground">Predict</Link>
            <Link href="/branches" className="pressable hover:text-foreground">Branches</Link>
            <Link href="/colleges" className="pressable hover:text-foreground">Colleges</Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/70">
          Cutoffs shown are indicative sample data for guidance only. Always
          verify against official KEA results at cetonline.karnataka.gov.in
          before making admission decisions.
        </p>
      </div>
    </footer>
  );
}
