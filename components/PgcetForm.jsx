"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * PGCET predictor form. Programme + round + category + rank (or marks). KEA so
 * far published MBA Round 2 and MCA Round 1 cut-offs, so switching programme
 * snaps the round to that programme's published round — but the round picker is
 * shown (like KCET) so more rounds slot in as KEA releases them. A PGCET rank
 * only makes sense within one programme, so the programme is always chosen here.
 */
export function PgcetForm({ taxonomy, defaults = {} }) {
  const router = useRouter();
  // PGCET publishes different rounds per programme (MCA has R1 & R2, MBA only
  // R2 so far), so the round options follow the chosen programme and default to
  // its latest round.
  const roundNum = (r) => parseInt(String(r).replace(/\D/g, ""), 10) || 0;
  const roundsFor = (b) =>
    taxonomy.coverage
      .filter((c) => c.branch === b)
      .sort((x, y) => roundNum(x.round) - roundNum(y.round))
      .map((c) => ({ code: c.round, name: c.roundName }));
  const latestRoundFor = (b) =>
    roundsFor(b).at(-1)?.code || taxonomy.rounds.at(-1)?.code;

  const firstBranch = defaults.branch || taxonomy.branches[0]?.code;
  const [branch, setBranch] = useState(firstBranch);
  const [round, setRound] = useState(defaults.round || latestRoundFor(firstBranch));
  const [category, setCategory] = useState(defaults.category || "GM");
  const [rank, setRank] = useState(defaults.rank || "");
  const [marks, setMarks] = useState(defaults.marks || "");

  const hasInput = parseInt(rank, 10) > 0 || parseInt(marks, 10) > 0;

  // switching programme snaps the round to that programme's latest round
  const onBranch = (v) => {
    setBranch(v);
    setRound(latestRoundFor(v));
  };

  const submit = (e) => {
    e.preventDefault();
    const params = { branch, round, category };
    const n = parseInt(rank, 10);
    const mk = parseInt(marks, 10);
    if (n > 0) params.rank = String(n); // exact rank wins over a marks estimate
    else if (mk > 0) params.marks = String(mk);
    router.push(`/pgcet/predict?${new URLSearchParams(params)}`);
  };

  return (
    <div className="glass rounded-3xl border border-border/50 p-4 shadow-ios-lg sm:p-5">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field label="Programme">
          <Select
            aria-label="Programme"
            value={branch}
            onChange={onBranch}
            options={taxonomy.branches.map((b) => ({ value: b.code, label: `${b.code} — ${b.name}` }))}
          />
        </Field>
        <Field label="Round">
          <Select
            aria-label="Round"
            value={round}
            onChange={setRound}
            options={roundsFor(branch).map((r) => ({ value: r.code, label: r.name }))}
          />
        </Field>
        <Field label="Category" className="sm:col-span-2">
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
        <Field label={`Your PGCET ${branch} rank`}>
          <Input
            inputMode="numeric"
            placeholder="e.g. 1800"
            value={rank}
            onChange={(e) => setRank(e.target.value.replace(/[^0-9]/g, ""))}
            className="text-lg"
          />
        </Field>
        <Field label="…or your PGCET marks">
          <Input
            inputMode="numeric"
            placeholder="e.g. 52"
            value={marks}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              // PGCET tops out at ~75 (both MBA & MCA) — clamp there, not 100,
              // so an impossible 3-4 digit "mark" can't masquerade as a topper.
              setMarks(v === "" ? "" : String(Math.min(75, parseInt(v, 10))));
            }}
            className="text-lg"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 w-full gap-2 sm:col-span-2">
          <Search className="size-4" />
          {hasInput ? "Find my colleges" : "Browse cut-offs"}
        </Button>
      </form>
      <p className="mt-2.5 px-1 text-xs text-muted-foreground">
        Enter your <span className="font-medium text-foreground">rank</span> for an exact match, or
        just your <span className="font-medium text-foreground">marks</span> for an estimated rank —
        PGCET tops out near <span className="font-medium text-foreground">75</span>, so 60+ usually
        means a top rank. Genuine KEA cut-offs —{" "}
        <span className="font-medium text-foreground">MCA Rounds 1 &amp; 2</span> and{" "}
        <span className="font-medium text-foreground">MBA Round 2</span>.
      </p>
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
