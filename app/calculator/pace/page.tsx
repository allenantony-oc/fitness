"use client";

import { useMemo, useState } from "react";
import { CalculatorShell, ResultActions, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import {
  RACE_DISTANCES_KM,
  formatPace,
  formatTime,
} from "@/lib/calculators";

type Mode = "pace" | "time" | "distance";
type DistUnit = "km" | "mi";

export default function PacePage() {
  const [mode, setMode] = useState<Mode>("pace");
  const [unit, setUnit] = useState<DistUnit>("km");

  // distance inputs (in chosen unit)
  const [distance, setDistance] = useState("10");
  // time inputs (mm:ss or h:mm:ss components)
  const [hours, setHours] = useState("0");
  const [mins, setMins] = useState("50");
  const [secs, setSecs] = useState("0");
  // pace inputs (per chosen unit, mm:ss)
  const [paceMin, setPaceMin] = useState("5");
  const [paceSec, setPaceSec] = useState("0");

  const totalSeconds =
    (parseInt(hours, 10) || 0) * 3600 +
    (parseInt(mins, 10) || 0) * 60 +
    (parseInt(secs, 10) || 0);
  const distanceKm =
    (parseFloat(distance) || 0) * (unit === "km" ? 1 : 1.609344);
  const paceSecPerInputUnit =
    (parseInt(paceMin, 10) || 0) * 60 + (parseInt(paceSec, 10) || 0);
  const paceSecPerKm =
    paceSecPerInputUnit / (unit === "km" ? 1 : 1.609344);

  const result = useMemo(() => {
    if (mode === "pace") {
      if (totalSeconds <= 0 || distanceKm <= 0) return null;
      const secPerKm = totalSeconds / distanceKm;
      return {
        type: "pace" as const,
        secPerKm,
        time: totalSeconds,
        km: distanceKm,
      };
    }
    if (mode === "time") {
      if (paceSecPerKm <= 0 || distanceKm <= 0) return null;
      const time = paceSecPerKm * distanceKm;
      return {
        type: "time" as const,
        secPerKm: paceSecPerKm,
        time,
        km: distanceKm,
      };
    }
    if (paceSecPerKm <= 0 || totalSeconds <= 0) return null;
    const km = totalSeconds / paceSecPerKm;
    return {
      type: "distance" as const,
      secPerKm: paceSecPerKm,
      time: totalSeconds,
      km,
    };
  }, [mode, totalSeconds, distanceKm, paceSecPerKm]);

  return (
    <CalculatorShell
      title="Running Pace Calculator"
      tagline="Convert any two of pace, time, distance into the third — plus race-distance projections."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Label>Solve for</Label>
              <UnitToggle
                value={mode}
                onChange={setMode}
                options={[
                  { value: "pace", label: "Pace" },
                  { value: "time", label: "Time" },
                  { value: "distance", label: "Distance" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <UnitToggle
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "km", label: "km" },
                  { value: "mi", label: "mi" },
                ]}
              />
            </div>
          </div>

          {mode !== "distance" && (
            <div className="space-y-2">
              <Label>Distance ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>
          )}

          {mode !== "time" && (
            <div className="space-y-2">
              <Label>Total time</Label>
              <div className="grid grid-cols-3 gap-2">
                <TimePart label="hh" value={hours} onChange={setHours} />
                <TimePart label="mm" value={mins} onChange={setMins} />
                <TimePart label="ss" value={secs} onChange={setSecs} />
              </div>
            </div>
          )}

          {mode !== "pace" && (
            <div className="space-y-2">
              <Label>Pace (min:sec / {unit})</Label>
              <div className="grid grid-cols-2 gap-2">
                <TimePart label="min" value={paceMin} onChange={setPaceMin} />
                <TimePart label="sec" value={paceSec} onChange={setPaceSec} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatPill
              label="Pace"
              value={formatPace(result.secPerKm, unit)}
              accent={result.type === "pace"}
            />
            <StatPill
              label="Time"
              value={formatTime(result.time)}
              accent={result.type === "time"}
            />
            <StatPill
              label="Distance"
              value={`${(result.km / (unit === "km" ? 1 : 1.609344)).toFixed(2)} ${unit}`}
              accent={result.type === "distance"}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                At this pace, common race distances
              </div>
              <div className="space-y-2">
                {RACE_DISTANCES_KM.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-md border border-border/40 bg-card/50 px-3 py-2 text-sm"
                  >
                    <span>{r.name}</span>
                    <span className="font-mono tabular-nums">
                      {formatTime(result.secPerKm * r.km)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <ResultActions
            text={`Pace: ${formatPace(result.secPerKm, unit)} | Time: ${formatTime(result.time)} | Distance: ${(result.km / (unit === "km" ? 1 : 1.609344)).toFixed(2)} ${unit}`}
          />
        </>
      )}
    </CalculatorShell>
  );
}

function TimePart({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 text-center font-mono tabular-nums"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
