import { NextResponse } from "next/server";
import { getStudent } from "@/lib/data";

// Resolve a KCET application number to the student's rank + category.
export function GET(request) {
  const cet = request.nextUrl.searchParams.get("cet");
  if (!cet) {
    return NextResponse.json({ error: "'cet' required" }, { status: 400 });
  }
  const student = getStudent(cet);
  if (!student) {
    return NextResponse.json(
      { error: "No student found for that KCET number." },
      { status: 404 }
    );
  }
  return NextResponse.json({ student });
}
