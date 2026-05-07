"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { waterIntakeMl } from "@/lib/calculators";

type Unit = "kg" | "lb";

export default function WaterIntakePage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [weight, setWeight] = useState("75");
  const [trainingMin, setTrainingMin] = useState("60");
  const [hot, setHot] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const t = parseFloat(trainingMin) || 0;
    if (!w || w <= 0) return null;
    const kg = unit === "kg" ? w : w * 0.453592;
    const ml = waterIntakeMl(kg, t, hot);
    return {
      ml,
      liters: ml / 1000,
      cups: ml / 240,
      ozFl: ml / 29.5735,
    };
  }, [unit, weight, trainingMin, hot]);

  return (
    <CalculatorShell
      title="Water Intake Calculator"
      tagline="Daily hydration target from bodyweight, training duration, and climate."
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
              <Label>Daily training (min)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={trainingMin}
                onChange={(e) => setTrainingMin(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-md border border-border/60 bg-card p-3 text-sm cursor-pointer hover:bg-accent">
            <input
              type="checkbox"
              checked={hot}
              onChange={(e) => setHot(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span>
              Hot or humid climate{" "}
              <span className="text-muted-foreground">
                (adds 500 ml for sweat loss)
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {result && (
        <>
          <StatPill
            label="Daily target"
            value={`${result.liters.toFixed(2)} L`}
            hint={`${result.ml.toLocaleString()} ml`}
            accent
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="In cups (8 oz)"
              value={`${result.cups.toFixed(1)} cups`}
            />
            <StatPill
              label="In fluid ounces"
              value={`${Math.round(result.ozFl)} fl oz`}
            />
          </div>
          <ResultActions
            text={`Daily water: ${result.liters.toFixed(2)} L (${result.ml.toLocaleString()} ml) | ${result.cups.toFixed(1)} cups | ${Math.round(result.ozFl)} fl oz`}
          />
        </>
      )}

      <Card>
        <CardContent className="pt-6 text-xs text-muted-foreground">
          Baseline 35 ml/kg, +500 ml per hour of training, +500 ml for hot
          climate. Caffeine and alcohol don&apos;t cancel hydration but do add
          ~10–20% additional need. Listen to thirst — it&apos;s usually right.
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}
