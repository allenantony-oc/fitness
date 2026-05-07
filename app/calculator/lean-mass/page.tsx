"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UnitToggle } from "@/components/unit-toggle";
import { ValidatedField } from "@/components/validated-field";
import { leanMass, type Sex } from "@/lib/calculators";

type Unit = "metric" | "imperial";

export default function LeanMassPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("78");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [pounds, setPounds] = useState("172");

  const result = useMemo(() => {
    let h: number, w: number;
    if (unit === "metric") {
      h = parseFloat(heightCm);
      w = parseFloat(weightKg);
    } else {
      h = ((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)) * 2.54;
      w = (parseFloat(pounds) || 0) * 0.453592;
    }
    if (!h || !w || h < 100 || w < 30) return null;
    const lm = leanMass(sex, w, h);
    const avg = (lm.boer + lm.james + lm.hume) / 3;
    const fatKg = w - avg;
    const fatPct = (fatKg / w) * 100;
    return { lm, avg, fatKg, fatPct, totalKg: w };
  }, [unit, sex, heightCm, weightKg, feet, inches, pounds]);

  const fmt = (kg: number) =>
    unit === "metric"
      ? `${kg.toFixed(1)} kg`
      : `${(kg * 2.20462).toFixed(1)} lb`;

  return (
    <CalculatorShell
      title="Lean Body Mass Calculator"
      tagline="Boer, James, and Hume formulas — three estimates of fat-free mass from height and weight."
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
            <div className="grid grid-cols-2 gap-4">
              <ValidatedField
                label="Height (cm)"
                value={heightCm}
                onChange={setHeightCm}
                min={100}
                max={250}
              />
              <ValidatedField
                label="Weight (kg)"
                value={weightKg}
                onChange={setWeightKg}
                min={20}
                max={300}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <ValidatedField
                label="Height (ft)"
                value={feet}
                onChange={setFeet}
                min={3}
                max={8}
                inputMode="numeric"
              />
              <ValidatedField
                label="Height (in)"
                value={inches}
                onChange={setInches}
                min={0}
                max={11}
              />
              <ValidatedField
                label="Weight (lb)"
                value={pounds}
                onChange={setPounds}
                min={44}
                max={660}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill label="Lean mass (avg)" value={fmt(result.avg)} accent />
            <StatPill
              label="Implied body fat"
              value={`${result.fatPct.toFixed(1)}%`}
              hint={`${fmt(result.fatKg)} fat mass`}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                By formula
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormulaCell name="Boer" value={fmt(result.lm.boer)} />
                <FormulaCell name="James" value={fmt(result.lm.james)} />
                <FormulaCell name="Hume" value={fmt(result.lm.hume)} />
              </div>
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `Lean mass (avg): ${fmt(result.avg)} | Body fat: ${result.fatPct.toFixed(1)}% (${fmt(result.fatKg)})`,
              `Boer: ${fmt(result.lm.boer)} | James: ${fmt(result.lm.james)} | Hume: ${fmt(result.lm.hume)}`,
            ].join("\n")}
          />
        </>
      )}

      <Card>
        <CardContent className="pt-6 text-xs text-muted-foreground">
          Formula-based LBM is a rough proxy. For real precision use DEXA,
          BodPod, or hydrostatic weighing. Use these numbers to track trends,
          not as absolutes.
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}

function FormulaCell({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-card/50 p-3 text-center">
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}
