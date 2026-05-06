"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitToggle } from "@/components/unit-toggle";
import { Button } from "@/components/ui/button";

type Mode = "tabata" | "emom" | "amrap" | "custom";

interface Phase {
  label: string;
  seconds: number;
  kind: "work" | "rest";
}

const PRESETS: Record<Mode, { rounds: number; work: number; rest: number; name: string }> = {
  tabata: { rounds: 8, work: 20, rest: 10, name: "Tabata · 8×(20s/10s)" },
  emom: { rounds: 10, work: 50, rest: 10, name: "EMOM 10 · 50s/10s" },
  amrap: { rounds: 1, work: 1200, rest: 0, name: "AMRAP 20 min" },
  custom: { rounds: 5, work: 60, rest: 30, name: "Custom" },
};

export default function IntervalTimerPage() {
  const [mode, setMode] = useState<Mode>("tabata");
  const [rounds, setRounds] = useState(PRESETS.tabata.rounds);
  const [work, setWork] = useState(PRESETS.tabata.work);
  const [rest, setRest] = useState(PRESETS.tabata.rest);

  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(work);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const phases: Phase[] = [];
  for (let i = 0; i < rounds; i++) {
    phases.push({ label: `Round ${i + 1} · Work`, seconds: work, kind: "work" });
    if (rest > 0 && i < rounds - 1) {
      phases.push({ label: `Round ${i + 1} · Rest`, seconds: rest, kind: "rest" });
    }
  }
  const currentPhase = phases[phaseIdx];
  const isDone = phaseIdx >= phases.length;

  function applyPreset(m: Mode) {
    setMode(m);
    const p = PRESETS[m];
    setRounds(p.rounds);
    setWork(p.work);
    setRest(p.rest);
    reset(p.work);
  }

  function reset(initialWork = work) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPhaseIdx(0);
    setSecondsLeft(initialWork);
  }

  function beep(freq = 880, ms = 150) {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) {
          if (s <= 4) beep(660, 80);
          return s - 1;
        }
        // Phase ended
        beep(1000, 250);
        setPhaseIdx((idx) => {
          const next = idx + 1;
          if (next >= phases.length) {
            setRunning(false);
            return next;
          }
          return next;
        });
        return phases[Math.min(phaseIdx + 1, phases.length - 1)]?.seconds ?? 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx]);

  // Reset secondsLeft if user changes preset values while stopped
  useEffect(() => {
    if (!running && phaseIdx === 0) setSecondsLeft(work);
  }, [work, running, phaseIdx]);

  const totalSec = phases.reduce((acc, p) => acc + p.seconds, 0);
  const elapsedSec =
    phases.slice(0, phaseIdx).reduce((acc, p) => acc + p.seconds, 0) +
    ((currentPhase?.seconds ?? 0) - secondsLeft);
  const progress = totalSec > 0 ? (elapsedSec / totalSec) * 100 : 0;

  return (
    <CalculatorShell
      title="Interval Timer"
      tagline="Tabata, EMOM, AMRAP, or fully custom. Audio cues in the last 3 seconds."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label>Preset</Label>
            <UnitToggle
              value={mode}
              onChange={applyPreset}
              options={[
                { value: "tabata", label: "Tabata" },
                { value: "emom", label: "EMOM" },
                { value: "amrap", label: "AMRAP" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Rounds</Label>
              <Input
                type="number"
                min={1}
                value={rounds}
                onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={running}
              />
            </div>
            <div className="space-y-2">
              <Label>Work (s)</Label>
              <Input
                type="number"
                min={1}
                value={work}
                onChange={(e) => setWork(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={running}
              />
            </div>
            <div className="space-y-2">
              <Label>Rest (s)</Label>
              <Input
                type="number"
                min={0}
                value={rest}
                onChange={(e) => setRest(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={running}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={
          isDone
            ? "border-emerald-500/40 bg-emerald-500/10"
            : currentPhase?.kind === "rest"
              ? "border-sky-500/40 bg-sky-500/5"
              : "border-primary/40 bg-primary/5"
        }
      >
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {isDone ? "Complete" : currentPhase?.label}
          </div>
          <div className="text-7xl font-bold tabular-nums sm:text-8xl">
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
            {String(secondsLeft % 60).padStart(2, "0")}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="lg"
              onClick={() => {
                if (isDone) reset();
                setRunning((r) => !r);
              }}
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? "Pause" : isDone ? "Restart" : "Start"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => reset()}>
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </CalculatorShell>
  );
}
