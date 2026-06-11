import Link from "next/link";
import { dataYear } from "@/lib/data";

export function Footer() {
  const year = dataYear();
  return (
    <footer className="border-t border-border bg-card-soft">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md">
            KCET College Finder — a free tool to explore Karnataka engineering
            admissions by rank, branch and cutoff. <br />
            Built with ❤️ by{" "}
            <b>
              <a
              href="https://kousthubha.me"
              className="underline hover:text-foreground"
            >
              kousthubha.me
            </a>
            </b>
          </p>
          <nav className="flex gap-5 font-medium">
            <Link href="/predict" className="pressable hover:text-foreground">Predict</Link>
            <Link href="/branches" className="pressable hover:text-foreground">Branches</Link>
            <Link href="/colleges" className="pressable hover:text-foreground">Colleges</Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/70">
          ⚠️ The entire {year} dataset shown here is{" "}
          <b>indicative sample data</b>, not official KEA results — every closing
          rank is estimated and each college&apos;s branch list is generated
          heuristically, so ranks may be inaccurate and colleges may list
          branches they don&apos;t offer. Always verify against official KEA
          results at cetonline.karnataka.gov.in before making any admission
          decision.
        </p>
      </div>
    </footer>
  );
}
