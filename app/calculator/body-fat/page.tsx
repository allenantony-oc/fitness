"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { ValidatedField } from "@/components/validated-field";
import { bodyFatCategory, bodyFatNavy, type Sex } from "@/lib/calculators";

type Unit = "metric" | "imperial";

export default function BodyFatPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("178");
  const [neckCm, setNeckCm] = useState("38");
  const [waistCm, setWaistCm] = useState("85");
  const [hipCm, setHipCm] = useState("95");
  const [heightIn, setHeightIn] = useState("70");
  const [neckIn, setNeckIn] = useState("15");
  const [waistIn, setWaistIn] = useState("33.5");
  const [hipIn, setHipIn] = useState("37.5");

  const result = useMemo(() => {
    const toCm = (n: string) => (parseFloat(n) || 0) * 2.54;
    const h = unit === "metric" ? parseFloat(heightCm) : toCm(heightIn);
    const n = unit === "metric" ? parseFloat(neckCm) : toCm(neckIn);
    const wa = unit === "metric" ? parseFloat(waistCm) : toCm(waistIn);
    const hi = unit === "metric" ? parseFloat(hipCm) : toCm(hipIn);
    const pct = bodyFatNavy({
      sex,
      heightCm: h,
      neckCm: n,
      waistCm: wa,
      hipCm: sex === "female" ? hi : undefined,
    });
    if (pct === null || !isFinite(pct) || pct < 1 || pct > 70) return null;
    return { pct, category: bodyFatCategory(sex, pct) };
  }, [unit, sex, heightCm, neckCm, waistCm, hipCm, heightIn, neckIn, waistIn, hipIn]);

  return (
    <CalculatorShell
      title="Body Fat % Calculator"
      tagline="US Navy tape-measure method. No scale, no calipers — just a tape."
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
                  { value: "metric", label: "cm" },
                  { value: "imperial", label: "in" },
                ]}
              />
            </div>
          </div>

          {unit === "metric" ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} min={100} max={250} />
              <Field label="Neck (cm)" value={neckCm} onChange={setNeckCm} min={20} max={60} />
              <Field label="Waist (cm)" value={waistCm} onChange={setWaistCm} min={40} max={200} />
              {sex === "female" && (
                <Field label="Hip (cm)" value={hipCm} onChange={setHipCm} min={50} max={200} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (in)" value={heightIn} onChange={setHeightIn} min={36} max={96} />
              <Field label="Neck (in)" value={neckIn} onChange={setNeckIn} min={8} max={24} />
              <Field label="Waist (in)" value={waistIn} onChange={setWaistIn} min={16} max={79} />
              {sex === "female" && (
                <Field label="Hip (in)" value={hipIn} onChange={setHipIn} min={20} max={79} />
              )}
            </div>
          )}

          <div className="rounded-md border border-border/40 bg-card/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">How to measure:</strong> neck
            below the larynx; waist at the navel (men) or narrowest point
            (women); hip at the widest. Tape snug, not compressed.
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="Body fat"
              value={`${result.pct.toFixed(1)}%`}
              accent
            />
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Classification
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-400">
                {result.category}
              </div>
            </div>
          </div>
          <ResultActions
            text={`Body fat: ${result.pct.toFixed(1)}% (${result.category})`}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <ValidatedField label={label} value={value} onChange={onChange} min={min} max={max} />
  );
}
