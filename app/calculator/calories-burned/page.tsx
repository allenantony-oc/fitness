"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { caloriesBurned } from "@/lib/calculators";
import { ACTIVITIES, CATEGORY_LABELS, type Activity } from "@/lib/met-values";

type Unit = "kg" | "lb";

export default function CaloriesBurnedPage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [weight, setWeight] = useState("75");
  const [minutes, setMinutes] = useState("45");
  const [activitySlug, setActivitySlug] = useState<string>(ACTIVITIES[0].name);

  const activity = ACTIVITIES.find((a) => a.name === activitySlug) ?? ACTIVITIES[0];

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const m = parseFloat(minutes);
    if (!w || !m || w <= 0 || m <= 0) return null;
    const kg = unit === "kg" ? w : w * 0.453592;
    const kcal = caloriesBurned(activity.met, kg, m);
    return {
      kcal: Math.round(kcal),
      perHour: Math.round((kcal / m) * 60),
    };
  }, [unit, weight, minutes, activity]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Activity[]>();
    for (const a of ACTIVITIES) {
      const list = groups.get(a.category) ?? [];
      list.push(a);
      groups.set(a.category, list);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <CalculatorShell
      title="Calories Burned Calculator"
      tagline="MET-based estimate from the 2011 Compendium of Physical Activities. Pick an activity and a duration."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Bodyweight
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
              <Label>Weight ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Activity</Label>
            <select
              value={activitySlug}
              onChange={(e) => setActivitySlug(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {grouped.map(([cat, items]) => (
                <optgroup
                  key={cat}
                  label={CATEGORY_LABELS[cat as Activity["category"]]}
                >
                  {items.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} · {a.met} MET
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="Total burn"
              value={`${result.kcal.toLocaleString()} kcal`}
              hint={`for ${minutes} min`}
              accent
            />
            <StatPill
              label="Per hour"
              value={`${result.perHour.toLocaleString()} kcal`}
              hint="continuous rate"
            />
          </div>
          <ResultActions
            text={`Calories burned: ${result.kcal.toLocaleString()} kcal for ${minutes} min | ${result.perHour.toLocaleString()} kcal/hr (${activitySlug})`}
          />
        </>
      )}

      <Card>
        <CardContent className="pt-6 text-xs text-muted-foreground">
          MET (Metabolic Equivalent) values approximate energy cost relative to
          rest. 1 MET ≈ 1 kcal/kg/hour. Real burn varies ±20% based on
          intensity, terrain, and individual efficiency.
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}
