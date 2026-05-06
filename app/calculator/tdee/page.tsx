"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import {
  ACTIVITY_LABELS,
  ACTIVITY_MULTIPLIERS,
  bmrMifflin,
  tdee,
  type ActivityLevel,
  type Sex,
} from "@/lib/calculators";

type Unit = "metric" | "imperial";

const ACTIVITY_KEYS = Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[];

export default function TdeePage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("78");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [pounds, setPounds] = useState("172");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");

  const result = useMemo(() => {
    const a = parseFloat(age);
    let h: number, w: number;
    if (unit === "metric") {
      h = parseFloat(heightCm);
      w = parseFloat(weightKg);
    } else {
      h = ((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)) * 2.54;
      w = (parseFloat(pounds) || 0) * 0.453592;
    }
    if (!a || !h || !w || a < 10 || h < 50 || w < 10) return null;
    const bmr = bmrMifflin(sex, w, h, a);
    const total = tdee(bmr, activity);
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(total),
      cut: Math.round(total - 500),
      bulk: Math.round(total + 300),
    };
  }, [unit, sex, age, heightCm, weightKg, feet, inches, pounds, activity]);

  return (
    <CalculatorShell
      title="TDEE & BMR Calculator"
      tagline="Daily calorie burn using Mifflin-St Jeor — the most accurate formula for general use."
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Age (years)" value={age} onChange={setAge} />
            {unit === "metric" ? (
              <>
                <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} />
                <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
              </>
            ) : (
              <>
                <Field label="Height (ft)" value={feet} onChange={setFeet} />
                <Field label="Height (in)" value={inches} onChange={setInches} />
                <Field label="Weight (lb)" value={pounds} onChange={setPounds} />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Activity level</Label>
            <div className="grid gap-2">
              {ACTIVITY_KEYS.map((k) => {
                const active = activity === k;
                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setActivity(k)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{ACTIVITY_LABELS[k]}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        ×{ACTIVITY_MULTIPLIERS[k]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="BMR"
              value={result.bmr.toLocaleString()}
              hint="kcal at rest"
            />
            <StatPill
              label="TDEE"
              value={result.tdee.toLocaleString()}
              hint="kcal / day"
              accent
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatPill
              label="Cut (-500)"
              value={result.cut.toLocaleString()}
              hint="~1 lb / week loss"
            />
            <StatPill
              label="Maintain"
              value={result.tdee.toLocaleString()}
              hint="hold weight"
            />
            <StatPill
              label="Bulk (+300)"
              value={result.bulk.toLocaleString()}
              hint="lean mass gain"
            />
          </div>
        </>
      )}
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
