"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UnitToggle } from "@/components/unit-toggle";
import { ValidatedField, type InputMode } from "@/components/validated-field";
import {
  ONE_RM_PERCENT_TABLE,
  oneRepMaxBrzycki,
  oneRepMaxEpley,
} from "@/lib/calculators";

type Unit = "kg" | "lb";

export default function OneRmPage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0 || r > 36) return null;
    const epley = oneRepMaxEpley(w, r);
    const brzycki = oneRepMaxBrzycki(w, r);
    const avg = (epley + brzycki) / 2;
    return { epley, brzycki, avg };
  }, [weight, reps]);

  return (
    <CalculatorShell
      title="One Rep Max Calculator"
      tagline="Estimate your 1RM from a recent set, plus working-set percentages for 2–15 reps."
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
            <Field
              label={`Weight lifted (${unit})`}
              value={weight}
              onChange={setWeight}
              min={1}
              max={unit === "kg" ? 500 : 1100}
            />
            <Field
              label="Reps performed"
              value={reps}
              onChange={setReps}
              min={1}
              max={36}
              inputMode="numeric"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Estimates are most accurate at 1–10 reps. Above 10 reps, fatigue
            and form drift increase error.
          </p>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatPill
              label="Epley"
              value={`${Math.round(result.epley)} ${unit}`}
            />
            <StatPill
              label="Brzycki"
              value={`${Math.round(result.brzycki)} ${unit}`}
            />
            <StatPill
              label="Average 1RM"
              value={`${Math.round(result.avg)} ${unit}`}
              accent
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Working sets ({unit})
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {ONE_RM_PERCENT_TABLE.map((row) => {
                  const load = (result.avg * row.percent) / 100;
                  return (
                    <div
                      key={row.reps}
                      className="rounded-md border border-border/40 bg-card/50 p-3 text-center"
                    >
                      <div className="text-xs text-muted-foreground">
                        {row.reps} reps · {row.percent}%
                      </div>
                      <div className="mt-1 text-lg font-bold tabular-nums">
                        {Math.round(load / 2.5) * 2.5}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Loads rounded to nearest 2.5 {unit} (smallest standard plate
                pair).
              </p>
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `1RM Estimates (${weight} ${unit} × ${reps} reps)`,
              `Epley: ${Math.round(result.epley)} ${unit} | Brzycki: ${Math.round(result.brzycki)} ${unit} | Average: ${Math.round(result.avg)} ${unit}`,
            ].join("\n")}
          />
        </>
      )}
    </CalculatorShell>
  );
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  inputMode?: InputMode;
}) {
  return (
    <ValidatedField
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      inputMode={inputMode}
    />
  );
}
