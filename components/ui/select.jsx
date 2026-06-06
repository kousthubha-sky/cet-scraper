"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight styled native <select>. Robust, accessible, zero extra deps.
 * options: [{ value, label }]
 */
export function Select({ value, onChange, options, className, "aria-label": ariaLabel }) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-input bg-card px-4 pr-9 text-base font-medium text-foreground outline-none transition-[color,box-shadow,border-color] focus:border-ring focus:ring-4 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
