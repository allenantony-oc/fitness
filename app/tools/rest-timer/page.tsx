"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/unit-toggle";

interface SetEntry {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  ts: number;
}

const STORAGE_KEY = "rest-timer:sets";
const REST_PRESETS = [60, 90, 120, 180];

export default function RestTimerPage() {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [exercise, setExercise] = useState("Bench Press");
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");
  const [restSec, setRestSec] = useState(120);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSets(JSON.parse(raw) as SetEntry[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } catch {
      // ignore
    }
  }, [sets]);

  function beep() {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audioRef.current = new Ctx();
    }
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1000;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          beep();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [secondsLeft]);

  function logSet() {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0) return;
    const entry: SetEntry = {
      id: crypto.randomUUID(),
      exercise: exercise.trim() || "Set",
      weight: w,
      reps: r,
      ts: Date.now(),
    };
    setSets((prev) => [entry, ...prev].slice(0, 100));
    setSecondsLeft(restSec);
  }

  function removeSet(id: string) {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }

  function clearAll() {
    if (confirm("Clear all logged sets?")) setSets([]);
  }

  const lastByExercise = new Map<string, SetEntry>();
  for (const s of sets) {
    const key = s.exercise.toLowerCase();
    const prev = lastByExercise.get(key);
    if (!prev || s.ts > prev.ts) lastByExercise.set(key, s);
  }

  // PR detection: highest weight × reps for this exercise (excluding current).
  function isPR(s: SetEntry) {
    const peer = sets.filter(
      (x) => x.exercise.toLowerCase() === s.exercise.toLowerCase() && x.id !== s.id,
    );
    return peer.every((p) => s.weight > p.weight || (s.weight === p.weight && s.reps > p.reps));
  }

  return (
    <CalculatorShell
      title="Rest Timer + Set Logger"
      tagline="Tap to log a set, auto-start the rest clock. Saved locally — your last 100 sets persist between visits."
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
              placeholder="Bench Press"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight ({unit})</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
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

          <div className="space-y-2">
            <Label>Rest (seconds)</Label>
            <div className="flex flex-wrap gap-2">
              {REST_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRestSec(s)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    restSec === s
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/60 hover:bg-accent"
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={logSet}>
            <Plus className="h-5 w-5" />
            Log set & start rest
          </Button>
        </CardContent>
      </Card>

      <Card
        className={
          secondsLeft > 0
            ? "border-primary/40 bg-primary/5"
            : "border-border/60"
        }
      >
        <CardContent className="space-y-3 pt-6 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Rest
          </div>
          <div className="text-6xl font-bold tabular-nums">
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
            {String(secondsLeft % 60).padStart(2, "0")}
          </div>
          {secondsLeft > 0 && (
            <Button variant="outline" onClick={() => setSecondsLeft(0)}>
              <RotateCcw className="h-4 w-4" />
              Skip rest
            </Button>
          )}
        </CardContent>
      </Card>

      {sets.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Recent sets
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-rose-400"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1.5">
              {sets.slice(0, 20).map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between rounded-md border border-border/40 bg-card/50 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{s.exercise}</span>
                    {isPR(s) && (
                      <span className="ml-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-400">
                        PR
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums">
                      {s.weight} {unit} × {s.reps}
                    </span>
                    <button
                      onClick={() => removeSet(s.id)}
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
      )}
    </CalculatorShell>
  );
}
