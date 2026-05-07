"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UnitToggle } from "@/components/unit-toggle";
import { ValidatedField } from "@/components/validated-field";
import {
  dotsScore,
  strengthLevel,
  wilksScore,
  type Sex,
} from "@/lib/calculators";

type Unit = "kg" | "lb";

export default function WilksPage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [sex, setSex] = useState<Sex>("male");
  const [bodyweight, setBodyweight] = useState("80");
  const [squat, setSquat] = useState("160");
  const [bench, setBench] = useState("110");
  const [deadlift, setDeadlift] = useState("200");

  const result = useMemo(() => {
    const bw = parseFloat(bodyweight);
    const s = parseFloat(squat) || 0;
    const b = parseFloat(bench) || 0;
    const d = parseFloat(deadlift) || 0;
    if (!bw || bw < 30) return null;
    const factor = unit === "kg" ? 1 : 0.453592;
    const bwKg = bw * factor;
    const total = (s + b + d) * factor;
    if (total <= 0) return null;
    const w = wilksScore(sex, bwKg, total);
    const dts = dotsScore(sex, bwKg, total);
    return {
      total: s + b + d,
      wilks: w,
      dots: dts,
      level: strengthLevel(w),
    };
  }, [unit, sex, bodyweight, squat, bench, deadlift]);

  return (
    <CalculatorShell
      title="Wilks & DOTS Calculator"
      tagline="Powerlifting relative-strength scores. Compare totals across bodyweight classes."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Label>Sex</Label>
              <UnitToggle
                value={sex}
                onChange={setSex}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Units</Label>
              <UnitToggle
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "kg", label: "kg" },
                  { value: "lb", label: "lb" },
                ]}
              />
            </div>
          </div>

          <ValidatedField
            label={`Bodyweight (${unit})`}
            value={bodyweight}
            onChange={setBodyweight}
            min={unit === "kg" ? 30 : 66}
            max={unit === "kg" ? 200 : 440}
          />

          <div className="grid grid-cols-3 gap-4">
            <ValidatedField
              label={`Squat (${unit})`}
              value={squat}
              onChange={setSquat}
              min={1}
              max={unit === "kg" ? 500 : 1100}
            />
            <ValidatedField
              label={`Bench (${unit})`}
              value={bench}
              onChange={setBench}
              min={1}
              max={unit === "kg" ? 500 : 1100}
            />
            <ValidatedField
              label={`Deadlift (${unit})`}
              value={deadlift}
              onChange={setDeadlift}
              min={1}
              max={unit === "kg" ? 500 : 1100}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatPill
              label="SBD total"
              value={`${result.total.toLocaleString()} ${unit}`}
              hint="squat + bench + deadlift"
            />
            <StatPill
              label="Wilks"
              value={result.wilks.toFixed(1)}
              hint="2020 coefficients"
              accent
            />
            <StatPill
              label="DOTS"
              value={result.dots.toFixed(1)}
              hint="open formula"
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Approximate level
                  </div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">
                    {result.level}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Beginner &lt; 200 · Novice 200 · Intermediate 300 · Advanced
                  400 · Elite 500+
                </div>
              </div>
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `SBD total: ${result.total.toLocaleString()} ${unit} | Wilks: ${result.wilks.toFixed(1)} | DOTS: ${result.dots.toFixed(1)}`,
              `Level: ${result.level}`,
            ].join("\n")}
          />
        </>
      )}
    </CalculatorShell>
  );
}
