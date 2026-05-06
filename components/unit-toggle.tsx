"use client";

import { cn } from "@/lib/utils";

interface UnitToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  className?: string;
}

export function UnitToggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: UnitToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex rounded-md border border-input bg-background p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
