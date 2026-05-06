"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/unit-toggle";

interface LiftEntry {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = "overload:entries";

export default function OverloadPage() {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [exercise, setExercise] = useState("Squat");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("5");
  const [entries, setEntries] = useState<LiftEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw) as LiftEntry[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  function logLift() {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || !exercise.trim()) return;
    const entry: LiftEntry = {
      id: crypto.randomUUID(),
      exercise: exercise.trim(),
      weight: w,
      reps: r,
      date: new Date().toISOString().slice(0, 10),
    };
    setEntries((prev) => [entry, ...prev]);
    setWeight("");
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAll() {
    if (confirm("Clear all logged lifts?")) setEntries([]);
  }

  const grouped = useMemo(() => {
    const map = new Map<string, LiftEntry[]>();
    for (const e of entries) {
      const key = e.exercise.toLowerCase();
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([, list]) => ({
      name: list[0].exercise,
      entries: list.slice().sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, [entries]);

  function getSuggestion(history: LiftEntry[]): { weight: number; note: string } | null {
    if (history.length === 0) return null;
    const last = history[0];
    const recentSame = history.filter(
      (e) => e.weight === last.weight && e.reps >= last.reps,
    );
    // If last 2+ sessions hit target reps, suggest +2.5 kg / +5 lb
    if (recentSame.length >= 2) {
      return {
        weight: last.weight + (unit === "kg" ? 2.5 : 5),
        note: `${recentSame.length} sessions in a row at ${last.weight} ${unit} × ${last.reps}+ reps — bump it up.`,
      };
    }
    if (recentSame.length === 1 && last.reps >= 5) {
      return {
        weight: last.weight,
        note: `Hit it again — needs 2 clean sessions before bumping.`,
      };
    }
    return {
      weight: last.weight,
      note: `Last session: ${last.weight} ${unit} × ${last.reps}. Try for one more rep.`,
    };
  }

  return (
    <CalculatorShell
      title="Progressive Overload Tracker"
      tagline="Log your top set per session — get an auto-suggested next-session load. Saved locally."
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
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>Exercise</Label>
            <Input
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="Squat, Bench, OHP, …"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Top set ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Reps</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={logLift}>
            <Plus className="h-5 w-5" />
            Log session
          </Button>
        </CardContent>
      </Card>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No lifts logged yet. Log your first to start tracking progress.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">By exercise</h2>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-rose-400"
            >
              Clear all
            </button>
          </div>
          {grouped.map((g) => {
            const suggestion = getSuggestion(g.entries);
            const best = g.entries.reduce(
              (acc, e) => (e.weight > acc.weight ? e : acc),
              g.entries[0],
            );
            return (
              <Card key={g.name}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{g.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      Best:{" "}
                      <span className="font-mono text-foreground">
                        {best.weight} {unit} × {best.reps}
                      </span>
                    </div>
                  </div>

                  {suggestion && (
                    <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                      <TrendingUp className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <div className="font-medium">
                          Next session: try {suggestion.weight} {unit} × {g.entries[0].reps}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.note}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {g.entries.slice(0, 8).map((e) => (
                      <div
                        key={e.id}
                        className="group flex items-center justify-between rounded-md border border-border/30 px-3 py-1.5 text-sm"
                      >
                        <span className="text-muted-foreground">{e.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono tabular-nums">
                            {e.weight} {unit} × {e.reps}
                          </span>
                          <button
                            onClick={() => remove(e.id)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </CalculatorShell>
  );
}
