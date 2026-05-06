"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  EQUIPMENT_LABELS,
  EXERCISES,
  MUSCLE_LABELS,
  type Equipment,
  type Exercise,
  type Muscle,
} from "@/lib/exercises";

type MuscleFilter = "all" | Muscle;
type EquipFilter = "all" | Equipment;

const MUSCLE_OPTIONS: { value: MuscleFilter; label: string }[] = [
  { value: "all", label: "All muscles" },
  ...(Object.keys(MUSCLE_LABELS) as Muscle[]).map((m) => ({
    value: m,
    label: MUSCLE_LABELS[m],
  })),
];

const EQUIP_OPTIONS: { value: EquipFilter; label: string }[] = [
  { value: "all", label: "All equipment" },
  ...(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((e) => ({
    value: e,
    label: EQUIPMENT_LABELS[e],
  })),
];

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleFilter>("all");
  const [equip, setEquip] = useState<EquipFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (muscle !== "all" && e.primary !== muscle && !e.secondary.includes(muscle))
        return false;
      if (equip !== "all" && e.equipment !== equip) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.cue.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, muscle, equip]);

  return (
    <CalculatorShell
      title="Exercise Library"
      tagline={`${EXERCISES.length} foundational lifts with form cues. Filter by muscle or equipment.`}
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises…"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value as MuscleFilter)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {MUSCLE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={equip}
              onChange={(e) => setEquip(e.target.value as EquipFilter)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {EQUIP_OPTIONS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        {filtered.length} of {EXERCISES.length} exercises
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((ex) => (
          <ExerciseCard key={ex.slug} exercise={ex} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No exercises match those filters.
          </CardContent>
        </Card>
      )}
    </CalculatorShell>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40">
      <div>
        <div className="font-semibold">{exercise.name}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Tag>{MUSCLE_LABELS[exercise.primary]}</Tag>
          {exercise.secondary.map((m) => (
            <Tag key={m} muted>
              {MUSCLE_LABELS[m]}
            </Tag>
          ))}
          <Tag accent>{EQUIPMENT_LABELS[exercise.equipment]}</Tag>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{exercise.cue}</div>
    </div>
  );
}

function Tag({
  children,
  muted,
  accent,
}: {
  children: React.ReactNode;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
        accent
          ? "border border-primary/40 bg-primary/10 text-primary"
          : muted
            ? "border border-border/40 text-muted-foreground"
            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      }`}
    >
      {children}
    </span>
  );
}
