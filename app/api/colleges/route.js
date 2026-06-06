import { NextResponse } from "next/server";
import { getColleges } from "@/lib/data";

export function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") || "").toLowerCase().trim();
  let colleges = getColleges();
  if (q) {
    colleges = colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ count: colleges.length, colleges });
}
