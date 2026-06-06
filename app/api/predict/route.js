import { NextResponse } from "next/server";
import { getCutoffs } from "@/lib/data";
import { predict, summarize } from "@/lib/eligibility";

const csv = (v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined);

export function GET(request) {
  const sp = request.nextUrl.searchParams;
  const rank = Number(sp.get("rank"));
  if (!rank || rank < 1) {
    return NextResponse.json({ error: "valid 'rank' required" }, { status: 400 });
  }
  const matches = predict(getCutoffs(), {
    rank,
    category: sp.get("category") || "GM",
    round: sp.get("round") || "R1",
    branches: csv(sp.get("branches")),
    cities: csv(sp.get("cities")),
    types: csv(sp.get("types")),
    includeReach: sp.get("includeReach") !== "false",
  });
  return NextResponse.json({ count: matches.length, summary: summarize(matches), matches });
}
