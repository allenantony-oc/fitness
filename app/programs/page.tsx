"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROGRAMS, type Program } from "@/lib/programs";

const LEVEL_COLORS: Record<Program["level"], string> = {
  Beginner: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Intermediate: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  Advanced: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};

export default function ProgramsPage() {
  const [active, setActive] = useState<Program>(PROGRAMS[0]);

  return (
    <CalculatorShell
      title="Strength Program Library"
      tagline="Time-tested templates: pick one, follow it for 12 weeks before you change anything."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROGRAMS.map((p) => {
          const isActive = active.slug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p)}
              className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.name}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${LEVEL_COLORS[p.level]}`}
                >
                  {p.level}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{p.blurb}</div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{p.daysPerWeek} days/wk</span>
                <span>·</span>
                <span>{p.goal}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{active.name}</h2>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="space-y-4 print:space-y-2">
        {active.days.map((day) => (
          <Card key={day.name}>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                {day.name}
              </div>
              <div className="space-y-1.5">
                {day.exercises.map((ex, i) => (
                  <div
                    key={`${day.name}-${i}`}
                    className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-1.5 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{ex.name}</div>
                      {ex.notes && (
                        <div className="text-xs text-muted-foreground">
                          {ex.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-sm tabular-nums text-muted-foreground">
                      {ex.sets} × {ex.reps}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {active.notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </CalculatorShell>
  );
}
