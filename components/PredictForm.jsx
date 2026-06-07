"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PredictForm({ taxonomy, defaults = {}, compact = false }) {
  const router = useRouter();
  const [rank, setRank] = useState(defaults.rank || "");
  const [category, setCategory] = useState(defaults.category || "GM");
  const [round, setRound] = useState(defaults.round || "R1");

  const submit = (e) => {
    e.preventDefault();
    const n = parseInt(rank, 10);
    if (!n || n < 1) return;
    router.push(
      `/predict?${new URLSearchParams({ rank: String(n), category, round })}`
    );
  };

  return (
    <div className="glass rounded-3xl border border-border/50 p-4 shadow-ios-lg sm:p-5">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field label="Your KCET rank" className="sm:col-span-2">
          <Input
            inputMode="numeric"
            placeholder="e.g. 5200"
            value={rank}
            onChange={(e) => setRank(e.target.value.replace(/[^0-9]/g, ""))}
            autoFocus={!compact}
            className="text-lg"
          />
        </Field>
        <Field label="Category">
          <Select
            aria-label="Category"
            value={category}
            onChange={setCategory}
            options={taxonomy.categories.map((c) => ({
              value: c.code,
              label: `${c.code} — ${c.name}`,
            }))}
          />
        </Field>
        <Field label="Round">
          <Select
            aria-label="Round"
            value={round}
            onChange={setRound}
            options={taxonomy.rounds.map((r) => ({
              value: r.code,
              label: r.name,
            }))}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 w-full gap-2 sm:col-span-2">
          <Search className="size-4" />
          Find my colleges
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
