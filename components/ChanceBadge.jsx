import { cn } from "@/lib/utils";
import { CHANCE } from "@/lib/eligibility";

export function ChanceBadge({ chance, className }) {
  const c = CHANCE[chance];
  if (!c) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        c.className,
        className
      )}
      title={c.blurb}
    >
      {c.label}
    </span>
  );
}
