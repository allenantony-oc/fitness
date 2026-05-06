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
  macros,
  tdee,
  type ActivityLevel,
  type Goal,
  type Sex,
} from "@/lib/calculators";

type Unit = "metric" | "imperial";
const ACTIVITY_KEYS = Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[];

const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  cut: "20% deficit · ~1 lb/week loss · higher protein to preserve muscle",
  maintain: "Match TDEE · recomp territory",
  bulk: "15% surplus · slow lean gain (~0.5 lb/week)",
};

export default function MacrosPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("78");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [pounds, setPounds] = useState("172");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("cut");

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
    const total = tdee(bmrMifflin(sex, w, h, a), activity);
    return macros(total, goal, w);
  }, [unit, sex, age, heightCm, weightKg, feet, inches, pounds, activity, goal]);

  return (
    <CalculatorShell
      title="Macro Calculator"
      tagline="Daily protein, carbs, and fat targets — tuned for cutting, maintaining, or bulking."
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
            <Field label="Age" value={age} onChange={setAge} />
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
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ACTIVITY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Goal</Label>
            <UnitToggle
              value={goal}
              onChange={setGoal}
              options={[
                { value: "cut", label: "Cut" },
                { value: "maintain", label: "Maintain" },
                { value: "bulk", label: "Bulk" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              {GOAL_DESCRIPTIONS[goal]}
            </p>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <StatPill
            label="Daily target"
            value={`${result.calories.toLocaleString()} kcal`}
            accent
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MacroBlock
              name="Protein"
              grams={result.proteinG}
              kcal={result.proteinG * 4}
              total={result.calories}
              color="bg-emerald-500"
            />
            <MacroBlock
              name="Carbs"
              grams={result.carbsG}
              kcal={result.carbsG * 4}
              total={result.calories}
              color="bg-amber-500"
            />
            <MacroBlock
              name="Fat"
              grams={result.fatG}
              kcal={result.fatG * 9}
              total={result.calories}
              color="bg-rose-500"
            />
          </div>
        </>
      )}
    </CalculatorShell>
  );
}

function MacroBlock({
  name,
  grams,
  kcal,
  total,
  color,
}: {
  name: string;
  grams: number;
  kcal: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((kcal / total) * 100);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {name}
        </div>
        <div className="text-xs text-muted-foreground">{pct}%</div>
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">
        {grams}
        <span className="text-base font-normal text-muted-foreground"> g</span>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        {kcal.toLocaleString()} kcal
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
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
