"use client";

import { useMemo, useState } from "react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { idealWeights, type Sex } from "@/lib/calculators";

type Unit = "metric" | "imperial";

export default function IdealWeightPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("178");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");

  const result = useMemo(() => {
    const h =
      unit === "metric"
        ? parseFloat(heightCm)
        : ((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)) * 2.54;
    if (!h || h < 100) return null;
    return idealWeights(sex, h);
  }, [unit, sex, heightCm, feet, inches]);

  const fmt = (kg: number) =>
    unit === "metric"
      ? `${kg.toFixed(1)} kg`
      : `${(kg * 2.20462).toFixed(1)} lb`;

  return (
    <CalculatorShell
      title="Ideal Weight Calculator"
      tagline="Four classical formulas plus the WHO healthy BMI range — see them side-by-side."
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
                  { value: "metric", label: "Metric" },
                  { value: "imperial", label: "Imperial" },
                ]}
              />
            </div>
          </div>

          {unit === "metric" ? (
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (ft)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (in)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 text-sm font-medium text-muted-foreground">
              Estimates
            </div>
            <div className="space-y-3">
              <Row name="Devine (1974)" value={fmt(result.devine)} hint="Used clinically for drug dosing" />
              <Row name="Robinson (1983)" value={fmt(result.robinson)} hint="Modernised Devine" />
              <Row name="Hamwi (1964)" value={fmt(result.hamwi)} hint="The original quick formula" />
              <Row
                name="WHO healthy BMI range"
                value={`${fmt(result.bmiLow)} – ${fmt(result.bmiHigh)}`}
                hint="BMI 18.5–24.9 — most evidence-based of the four"
                accent
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 text-xs text-muted-foreground">
          Ideal-weight formulas are population averages — they don&apos;t
          account for muscle mass or body composition. A lifter at 18% body fat
          will land above all three. Use BMI range as the actual sanity check.
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}

function Row({
  name,
  value,
  hint,
  accent,
}: {
  name: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-4 py-3 ${
        accent ? "border-primary/40 bg-primary/5" : "border-border/40"
      }`}
    >
      <div>
        <div className="text-sm font-medium">{name}</div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}
