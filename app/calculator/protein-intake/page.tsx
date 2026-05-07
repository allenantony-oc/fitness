"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UnitToggle } from "@/components/unit-toggle";
import { Label } from "@/components/ui/label";
import { ValidatedField } from "@/components/validated-field";
import {
  PROTEIN_GOAL_LABELS,
  PROTEIN_GRAMS_PER_KG,
  type ProteinGoal,
} from "@/lib/calculators";

type Unit = "kg" | "lb";

const GOAL_KEYS = Object.keys(PROTEIN_GRAMS_PER_KG) as ProteinGoal[];

export default function ProteinIntakePage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [weight, setWeight] = useState("75");
  const [goal, setGoal] = useState<ProteinGoal>("strength");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;
    const kg = unit === "kg" ? w : w * 0.453592;
    const [low, high] = PROTEIN_GRAMS_PER_KG[goal];
    const lowG = Math.round(kg * low);
    const highG = Math.round(kg * high);
    return {
      lowG,
      highG,
      midG: Math.round((lowG + highG) / 2),
      perMeal4: Math.round(((lowG + highG) / 2) / 4),
      kcal: Math.round((lowG + highG) / 2) * 4,
    };
  }, [unit, weight, goal]);

  return (
    <CalculatorShell
      title="Protein Intake Calculator"
      tagline="Daily protein target by goal — backed by ISSN position-stand recommendations."
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

          <ValidatedField
            label={`Weight (${unit})`}
            value={weight}
            onChange={setWeight}
            min={unit === "kg" ? 20 : 44}
            max={unit === "kg" ? 300 : 660}
          />

          <div className="space-y-2">
            <Label>Goal</Label>
            <div className="grid gap-2">
              {GOAL_KEYS.map((g) => {
                const [low, high] = PROTEIN_GRAMS_PER_KG[g];
                const active = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 hover:bg-accent"
                    }`}
                  >
                    <span>{PROTEIN_GOAL_LABELS[g]}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {low}–{high} g/kg
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <StatPill
            label="Daily protein target"
            value={`${result.lowG}–${result.highG} g`}
            hint={`midpoint ${result.midG} g · ${result.kcal} kcal`}
            accent
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill label="Per meal (4×)" value={`~${result.perMeal4} g`} />
            <StatPill
              label="Calories from protein"
              value={`${result.kcal.toLocaleString()} kcal`}
            />
          </div>
          <ResultActions
            text={`Daily protein: ${result.lowG}–${result.highG}g (midpoint ${result.midG}g) | ~${result.perMeal4}g per meal × 4 | ${result.kcal.toLocaleString()} kcal from protein`}
          />
        </>
      )}

      <Card>
        <CardContent className="pt-6 text-xs text-muted-foreground">
          Distribute across 3–5 meals at 0.4 g/kg each to maximise muscle
          protein synthesis. Above ~2.4 g/kg returns diminish for most lifters.
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}
