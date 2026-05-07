"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { recompTimeline } from "@/lib/calculators";

type Unit = "kg" | "lb";

export default function RecompTimelinePage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [current, setCurrent] = useState("85");
  const [goal, setGoal] = useState("78");
  const [deltaKcal, setDeltaKcal] = useState("-500");

  const result = useMemo(() => {
    const c = parseFloat(current);
    const g = parseFloat(goal);
    const d = parseFloat(deltaKcal);
    if (!c || !g || c <= 0 || g <= 0) return null;
    const factor = unit === "kg" ? 1 : 0.453592;
    const cKg = c * factor;
    const gKg = g * factor;
    const r = recompTimeline(cKg, gKg, d);
    if (!r) return null;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.round(r.weeks * 7));
    return {
      ...r,
      weeklyChangeDisplay: r.weeklyChangeKg / factor,
      totalChangeDisplay: r.totalChangeKg / factor,
      targetDate,
    };
  }, [current, goal, deltaKcal, unit]);

  return (
    <CalculatorShell
      title="Recomp Timeline Estimator"
      tagline="Project how long it takes to hit your goal weight at a given calorie deficit or surplus."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Units
            </span>
            <UnitToggle
              value={unit}
              onChange={setUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current weight ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Goal weight ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Daily calorie delta (− deficit / + surplus)
            </Label>
            <Input
              type="number"
              inputMode="decimal"
              value={deltaKcal}
              onChange={(e) => setDeltaKcal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              −500 kcal/day ≈ 1 lb/week loss. Sustainable cuts: −300 to −750.
              Lean bulks: +200 to +400.
            </p>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatPill
              label="Weeks to goal"
              value={result.weeks.toFixed(1)}
              hint={`~${Math.round(result.weeks / 4.345)} months`}
              accent
            />
            <StatPill
              label="Weekly change"
              value={`${result.weeklyChangeDisplay > 0 ? "+" : ""}${result.weeklyChangeDisplay.toFixed(2)} ${unit}`}
            />
            <StatPill
              label="Target date"
              value={result.targetDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Reality check:</strong> the
                7700 kcal/kg rule is linear, but bodies aren&apos;t. Expect
                faster loss in week 1 (water), then a steady rate, then a
                ~10–20% slowdown as TDEE adapts to lower bodyweight. Re-check
                your TDEE every 4–6 weeks.
              </div>
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `Weeks to goal: ${result.weeks.toFixed(1)} (~${Math.round(result.weeks / 4.345)} months)`,
              `Weekly change: ${result.weeklyChangeDisplay > 0 ? "+" : ""}${result.weeklyChangeDisplay.toFixed(2)} ${unit}`,
              `Target date: ${result.targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
            ].join("\n")}
          />
        </>
      )}
    </CalculatorShell>
  );
}
