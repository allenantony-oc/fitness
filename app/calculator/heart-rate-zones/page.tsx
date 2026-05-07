"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { heartRateZones } from "@/lib/calculators";

const ZONE_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-rose-500",
];

export default function HeartRateZonesPage() {
  const [age, setAge] = useState("30");
  const [resting, setResting] = useState("60");

  const result = useMemo(() => {
    const a = parseInt(age, 10);
    const r = parseInt(resting, 10);
    if (!a || !r || a < 10 || a > 100 || r < 30 || r > 120) return null;
    return {
      maxHr: 220 - a,
      restingHr: r,
      zones: heartRateZones(a, r),
    };
  }, [age, resting]);

  return (
    <CalculatorShell
      title="Heart Rate Zone Calculator"
      tagline="Karvonen method. Five training zones from your age and resting heart rate."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Resting heart rate (bpm)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={resting}
                onChange={(e) => setResting(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Measure resting HR first thing in the morning, before getting out
            of bed. Average over 5 days for accuracy.
          </p>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatPill
              label="Max heart rate"
              value={`${result.maxHr} bpm`}
              hint="220 − age"
              accent
            />
            <StatPill
              label="Heart rate reserve"
              value={`${result.maxHr - result.restingHr} bpm`}
              hint="max − resting"
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Training zones
              </div>
              <div className="space-y-2">
                {result.zones.map((z, i) => (
                  <div
                    key={z.name}
                    className="rounded-md border border-border/40 bg-card/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${ZONE_COLORS[i]}`}
                        />
                        <div>
                          <div className="text-sm font-semibold">{z.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {z.purpose}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm tabular-nums">
                          {z.hrLow}–{z.hrHigh} bpm
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {z.pctLow}–{z.pctHigh}% HRR
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `Max HR: ${result.maxHr} bpm | HRR: ${result.maxHr - result.restingHr} bpm`,
              ...result.zones.map(
                (z) => `${z.name}: ${z.hrLow}–${z.hrHigh} bpm (${z.pctLow}–${z.pctHigh}% HRR)`,
              ),
            ].join("\n")}
          />
        </>
      )}
    </CalculatorShell>
  );
}
