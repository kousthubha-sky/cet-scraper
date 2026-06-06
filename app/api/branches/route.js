import { NextResponse } from "next/server";
import { getCutoffs, getTaxonomy } from "@/lib/data";

// Per-branch GM Round-1 stats: how many colleges offer it and the cutoff spread.
export function GET() {
  const tax = getTaxonomy();
  const rows = getCutoffs().filter((r) => r.category === "GM" && r.round === "R1");
  const branches = tax.branches.map((b) => {
    const br = rows.filter((r) => r.branch === b.code);
    const ranks = br.map((r) => r.closingRank);
    return {
      ...b,
      colleges: br.length,
      bestCutoff: ranks.length ? Math.min(...ranks) : null,
      worstCutoff: ranks.length ? Math.max(...ranks) : null,
    };
  });
  return NextResponse.json({ branches });
}
