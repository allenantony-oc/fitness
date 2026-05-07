"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { bmi, bmiCategory, type BmiCategory } from "@/lib/calculators";

type Unit = "metric" | "imperial";

const CATEGORY_COLORS: Record<BmiCategory, string> = {
  Underweight: "text-sky-400",
  Normal: "text-emerald-400",
  Overweight: "text-amber-400",
  "Obese (Class I)": "text-orange-400",
  "Obese (Class II)": "text-rose-400",
  "Obese (Class III)": "text-rose-500",
};

const SCALE: { label: BmiCategory; range: string; min: number }[] = [
  { label: "Underweight", range: "< 18.5", min: 0 },
  { label: "Normal", range: "18.5 – 24.9", min: 18.5 },
  { label: "Overweight", range: "25 – 29.9", min: 25 },
  { label: "Obese (Class I)", range: "30 – 34.9", min: 30 },
  { label: "Obese (Class II)", range: "35 – 39.9", min: 35 },
  { label: "Obese (Class III)", range: "≥ 40", min: 40 },
];

export default function BmiPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("75");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("165");

  const result = useMemo(() => {
    let h: number, w: number;
    if (unit === "metric") {
      h = parseFloat(heightCm);
      w = parseFloat(weightKg);
    } else {
      const ft = parseFloat(feet) || 0;
      const inch = parseFloat(inches) || 0;
      h = (ft * 12 + inch) * 2.54;
      w = (parseFloat(pounds) || 0) * 0.453592;
    }
    if (!h || !w || h < 50 || w < 10) return null;
    const value = bmi(w, h);
    return { value, category: bmiCategory(value) };
  }, [unit, heightCm, weightKg, feet, inches, pounds]);

  return (
    <CalculatorShell
      title="BMI Calculator"
      tagline="Body mass index from height and weight, with WHO category bands."
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
                { value: "metric", label: "Metric" },
                { value: "imperial", label: "Imperial" },
              ]}
            />
          </div>

          {unit === "metric" ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} />
              <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <Field label="Height (ft)" value={feet} onChange={setFeet} />
              <Field label="Height (in)" value={inches} onChange={setInches} />
              <Field label="Weight (lb)" value={pounds} onChange={setPounds} />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="BMI"
              value={result.value.toFixed(1)}
              hint="kg / m²"
              accent
            />
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </div>
              <div
                className={`mt-2 text-3xl font-bold ${CATEGORY_COLORS[result.category]}`}
              >
                {result.category}
              </div>
            </div>
          </div>
          <ResultActions
            text={`BMI: ${result.value.toFixed(1)} kg/m² (${result.category})`}
          />
        </>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            WHO classification
          </div>
          <div className="space-y-2">
            {SCALE.map((row) => {
              const active = result?.category === row.label;
              return (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/40"
                  }`}
                >
                  <span className={active ? CATEGORY_COLORS[row.label] : ""}>
                    {row.label}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {row.range}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
