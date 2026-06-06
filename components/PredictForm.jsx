"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, IdCard, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PredictForm({ taxonomy, defaults = {}, compact = false }) {
  const router = useRouter();
  const [mode, setMode] = useState(defaults.cet ? "cet" : "rank");
  const [rank, setRank] = useState(defaults.rank || "");
  const [category, setCategory] = useState(defaults.category || "GM");
  const [round, setRound] = useState(defaults.round || "R1");
  const [cet, setCet] = useState(defaults.cet || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const go = (params) => router.push(`/predict?${params.toString()}`);

  const submitRank = (e) => {
    e.preventDefault();
    const n = parseInt(rank, 10);
    if (!n || n < 1) return;
    go(new URLSearchParams({ rank: String(n), category, round }));
  };

  const submitCet = async (e) => {
    e.preventDefault();
    setError("");
    const id = cet.trim();
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student?cet=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Lookup failed.");
        return;
      }
      const { student } = await res.json();
      go(
        new URLSearchParams({
          rank: String(student.rank),
          category: student.category,
          round,
          cet: student.cetNumber,
          name: student.name,
        })
      );
    } catch {
      setError("Could not reach the lookup service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-border/50 p-3 shadow-ios-lg sm:p-4">
      {/* iOS segmented control */}
      <div className="relative grid grid-cols-2 rounded-2xl bg-secondary/60 p-1 text-sm font-semibold">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-card shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform: mode === "cet" ? "translateX(100%)" : "translateX(0)",
          }}
        />
        <SegBtn active={mode === "rank"} onClick={() => setMode("rank")} icon={Hash}>
          I know my rank
        </SegBtn>
        <SegBtn active={mode === "cet"} onClick={() => setMode("cet")} icon={IdCard}>
          Use KCET number
        </SegBtn>
      </div>

      <div className="p-2 pt-4 sm:p-3 sm:pt-4">
        {mode === "rank" ? (
          <form onSubmit={submitRank} className="grid gap-3 sm:grid-cols-2">
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
            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full gap-2 sm:col-span-2"
            >
              <Search className="size-4" />
              Find my colleges
            </Button>
          </form>
        ) : (
          <form onSubmit={submitCet} className="grid gap-3 sm:grid-cols-2">
            <Field label="KCET application number" className="sm:col-span-2">
              <Input
                placeholder="e.g. KA25100001"
                value={cet}
                onChange={(e) => {
                  setCet(e.target.value.toUpperCase());
                  setError("");
                }}
                autoFocus={!compact}
                className="text-lg tracking-wide"
              />
            </Field>
            <Field label="Round" className="sm:col-span-2">
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
            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full gap-2 sm:col-span-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Look up my rank
            </Button>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              We fetch your rank &amp; category from your KCET number, then
              suggest colleges.{" "}
              {error ? "" : "Demo numbers: KA25100001 – KA25100800."}
            </p>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive sm:col-span-2"
              >
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 transition-colors duration-200",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
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
