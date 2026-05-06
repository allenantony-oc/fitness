"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Calendar, Flame, Trophy } from "lucide-react";
import { CalculatorShell, StatPill } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workout: string;
  durationMin: number;
  notes: string;
}

const STORAGE_KEY = "journal:entries";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [workout, setWorkout] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw) as JournalEntry[]);
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

  function addEntry() {
    if (!workout.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date,
      workout: workout.trim(),
      durationMin: parseInt(duration, 10) || 0,
      notes: notes.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    setWorkout("");
    setNotes("");
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAll() {
    if (confirm("Clear the entire journal? This cannot be undone.")) setEntries([]);
  }

  const stats = useMemo(() => {
    const now = Date.now();
    const week = entries.filter(
      (e) => now - new Date(e.date).getTime() < 7 * 24 * 3600 * 1000,
    );
    const month = entries.filter(
      (e) => now - new Date(e.date).getTime() < 30 * 24 * 3600 * 1000,
    );
    const totalMin = entries.reduce((acc, e) => acc + e.durationMin, 0);
    // Streak: consecutive days with at least one entry, counting back from today.
    const datesSet = new Set(entries.map((e) => e.date));
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (datesSet.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (i === 0) {
        // Today not logged yet — try yesterday before breaking
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return {
      total: entries.length,
      week: week.length,
      month: month.length,
      totalMin,
      streak,
    };
  }, [entries]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  return (
    <CalculatorShell
      title="Workout Journal"
      tagline="Log every session, track your streak, see the work add up. Saved locally — cloud sync coming soon."
    >
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill
            label="Streak"
            value={`${stats.streak}d`}
            hint="consecutive days"
            accent
          />
          <StatPill label="This week" value={`${stats.week}`} hint="sessions" />
          <StatPill label="This month" value={`${stats.month}`} hint="sessions" />
          <StatPill
            label="Total time"
            value={`${Math.round(stats.totalMin / 60)}h`}
            hint={`${stats.total} sessions`}
          />
        </div>
      )}

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workout</Label>
            <Input
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
              placeholder="Push Day · Bench, OHP, Lateral Raise…"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="PR on bench, knee felt fine, slept 8h"
            />
          </div>
          <Button size="lg" className="w-full" onClick={addEntry}>
            <Plus className="h-5 w-5" />
            Log workout
          </Button>
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No entries yet. Log your first workout to start the streak.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">History</h2>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-rose-400"
            >
              Clear journal
            </button>
          </div>
          <div className="space-y-2">
            {sorted.map((e, i) => {
              const isStreakBreaker = i === 0 && stats.streak > 2;
              return (
                <Card key={e.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {e.date}
                          <span>·</span>
                          <span>{e.durationMin} min</span>
                          {isStreakBreaker && (
                            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                              <Flame className="h-3 w-3" />
                              {stats.streak}d streak
                            </span>
                          )}
                        </div>
                        <div className="mt-2 font-medium">{e.workout}</div>
                        {e.notes && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {e.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => remove(e.id)}
                        className="text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="rounded-md border border-border/40 bg-card/30 p-3 text-center text-xs text-muted-foreground">
            <Trophy className="mx-auto mb-1 h-4 w-4 text-primary" />
            {stats.total} sessions · {Math.round(stats.totalMin / 60)} hours of work logged
          </div>
        </>
      )}
    </CalculatorShell>
  );
}
