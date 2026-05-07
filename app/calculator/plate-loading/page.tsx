"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UnitToggle } from "@/components/unit-toggle";
import { ValidatedField } from "@/components/validated-field";
import {
  STANDARD_PLATES_KG,
  STANDARD_PLATES_LB,
  platesPerSide,
} from "@/lib/calculators";

type Unit = "kg" | "lb";

const PLATE_COLORS: Record<string, string> = {
  "25": "bg-rose-500",
  "20": "bg-blue-500",
  "15": "bg-yellow-500",
  "10": "bg-emerald-500",
  "5": "bg-zinc-400",
  "2.5": "bg-zinc-500",
  "1.25": "bg-zinc-600",
  "45": "bg-blue-500",
  "35": "bg-yellow-500",
};

export default function PlateLoadingPage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [target, setTarget] = useState("100");
  const [bar, setBar] = useState("20");

  const available = unit === "kg" ? STANDARD_PLATES_KG : STANDARD_PLATES_LB;

  const result = useMemo(() => {
    const t = parseFloat(target);
    const b = parseFloat(bar);
    if (!t || !b || t < b) return null;
    return platesPerSide(t, b, available);
  }, [target, bar, available]);

  return (
    <CalculatorShell
      title="Plate Loading Calculator"
      tagline="See exactly which plates to load on each side of the bar — with a visual barbell."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Units
            </span>
            <UnitToggle
              value={unit}
              onChange={(u) => {
                setUnit(u);
                if (u === "kg") setBar("20");
                else setBar("45");
              }}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedField
              label={`Target weight (${unit})`}
              value={target}
              onChange={setTarget}
              min={unit === "kg" ? 10 : 22}
              max={unit === "kg" ? 500 : 1100}
            />
            <ValidatedField
              label={`Bar weight (${unit})`}
              value={bar}
              onChange={setBar}
              min={unit === "kg" ? 10 : 20}
              max={unit === "kg" ? 50 : 110}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardContent className="pt-6">
              <Barbell breakdown={result.perSide} unit={unit} />

              <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
                <div className="rounded-md border border-border/40 bg-card/50 p-3">
                  <div className="text-xs text-muted-foreground">Loaded</div>
                  <div className="mt-1 text-xl font-bold tabular-nums">
                    {result.loadable.toFixed(2)} {unit}
                  </div>
                </div>
                <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
                  <div className="text-xs text-muted-foreground">Per side</div>
                  <div className="mt-1 text-xl font-bold tabular-nums">
                    {((result.loadable - parseFloat(bar)) / 2).toFixed(2)} {unit}
                  </div>
                </div>
                <div className="rounded-md border border-border/40 bg-card/50 p-3">
                  <div className="text-xs text-muted-foreground">Short by</div>
                  <div className="mt-1 text-xl font-bold tabular-nums">
                    {result.remainder.toFixed(2)} {unit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Plates per side
              </div>
              {result.perSide.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Just the bar — no plates needed.
                </div>
              ) : (
                <div className="space-y-2">
                  {result.perSide.map((p) => (
                    <div
                      key={p.plate}
                      className="flex items-center justify-between rounded-md border border-border/40 bg-card/50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-sm ${
                            PLATE_COLORS[String(p.plate)] ?? "bg-zinc-500"
                          }`}
                        />
                        <span className="font-mono">
                          {p.plate} {unit}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums">
                        × {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <ResultActions
            text={[
              `Plate Loading: ${result.loadable.toFixed(2)} ${unit} loaded | Per side: ${((result.loadable - parseFloat(bar)) / 2).toFixed(2)} ${unit} | Short by: ${result.remainder.toFixed(2)} ${unit}`,
              result.perSide.length === 0
                ? "Just the bar — no plates needed"
                : `Plates per side: ${result.perSide.map((p) => `${p.plate} ${unit} × ${p.count}`).join(", ")}`,
            ].join("\n")}
          />
        </>
      )}
    </CalculatorShell>
  );
}

function Barbell({
  breakdown,
  unit,
}: {
  breakdown: { plate: number; count: number }[];
  unit: Unit;
}) {
  const allPlates: number[] = [];
  for (const p of breakdown) {
    for (let i = 0; i < p.count; i++) allPlates.push(p.plate);
  }
  const maxPlate = Math.max(...allPlates, 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-h-[120px] items-center justify-center gap-1 py-4">
        {/* Left collar */}
        <div className="flex items-center gap-0.5">
          {[...allPlates].reverse().map((p, i) => (
            <Plate key={`L-${i}`} weight={p} maxPlate={maxPlate} unit={unit} />
          ))}
        </div>
        {/* Bar */}
        <div className="h-2 w-32 rounded-sm bg-zinc-300 sm:w-48" />
        {/* Right collar */}
        <div className="flex items-center gap-0.5">
          {allPlates.map((p, i) => (
            <Plate key={`R-${i}`} weight={p} maxPlate={maxPlate} unit={unit} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Plate({
  weight,
  maxPlate,
  unit,
}: {
  weight: number;
  maxPlate: number;
  unit: Unit;
}) {
  const pct = 0.4 + 0.6 * (weight / maxPlate);
  const height = `${Math.round(pct * 100)}px`;
  const color = PLATE_COLORS[String(weight)] ?? "bg-zinc-500";
  return (
    <div
      className={`flex w-3 items-center justify-center rounded-sm sm:w-4 ${color}`}
      style={{ height }}
      title={`${weight} ${unit}`}
    />
  );
}
