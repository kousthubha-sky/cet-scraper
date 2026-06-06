"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatFees } from "@/lib/format";

export function CollegeSearch({ colleges, cities, types }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return colleges.filter(
      (c) =>
        (city === "all" || c.city === city) &&
        (type === "all" || c.type === type) &&
        (!needle ||
          c.name.toLowerCase().includes(needle) ||
          c.short.toLowerCase().includes(needle) ||
          c.city.toLowerCase().includes(needle) ||
          c.code.toLowerCase().includes(needle))
    );
  }, [colleges, q, city, type]);

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by college name, code or city…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          aria-label="City"
          value={city}
          onChange={setCity}
          className="sm:w-44"
          options={[{ value: "all", label: "All cities" }, ...cities.map((c) => ({ value: c, label: c }))]}
        />
        <Select
          aria-label="Type"
          value={type}
          onChange={setType}
          className="sm:w-40"
          options={[{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: t }))]}
        />
      </div>

      <p className="text-xs font-medium text-muted-foreground">{filtered.length} colleges</p>

      <div className="grid gap-3 stagger sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.code}
            href={`/colleges/${c.code}`}
            className="group glass pressable rounded-2xl border border-border/50 p-5 hover:border-primary/40 hover:shadow-ios"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold tracking-tight group-hover:text-primary">
                {c.short}
              </span>
              <span className="rounded-md border border-border/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {c.code}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.name}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {c.city}
              </span>
              <span>{c.type} · {formatFees(c.fees)}/yr</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="glass rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No colleges match your search.
        </p>
      )}
    </div>
  );
}
