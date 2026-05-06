"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Workout {
  name: string;
  warmup: string[];
  blocks: {
    title: string;
    exercises: { name: string; sets: string; reps: string; rest: string; cue?: string }[];
  }[];
  cooldown: string[];
  notes: string;
}

export default function AiWorkoutPage() {
  const [goal, setGoal] = useState("Build upper body strength");
  const [equipment, setEquipment] = useState("Barbell, dumbbells, pull-up bar");
  const [minutes, setMinutes] = useState("45");
  const [experience, setExperience] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/workout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          goal,
          equipment,
          minutes: parseInt(minutes, 10) || 45,
          experience,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
      } else {
        setResult(json as Workout);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CalculatorShell
      title="AI Workout Generator"
      tagline="Tell Claude your goal, equipment, and time. Get a structured workout in 5 seconds."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Equipment available</Label>
            <Input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minutes</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={generate} disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Generating…" : "Generate workout"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-rose-500/40 bg-rose-500/5">
          <CardContent className="pt-6 text-sm text-rose-300">{error}</CardContent>
        </Card>
      )}

      {result && (
        <>
          <div>
            <h2 className="text-2xl font-bold">{result.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{result.notes}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Section title="Warm-up">
                <BulletList items={result.warmup} />
              </Section>
            </CardContent>
          </Card>

          {result.blocks.map((b, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Section title={b.title}>
                  <div className="space-y-1.5">
                    {b.exercises.map((ex, j) => (
                      <div
                        key={j}
                        className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-1.5 last:border-0"
                      >
                        <div>
                          <div className="font-medium">{ex.name}</div>
                          {ex.cue && (
                            <div className="text-xs text-muted-foreground">
                              {ex.cue}
                            </div>
                          )}
                        </div>
                        <div className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                          <div>
                            {ex.sets} × {ex.reps}
                          </div>
                          <div className="text-xs">rest {ex.rest}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <Section title="Cooldown">
                <BulletList items={result.cooldown} />
              </Section>
            </CardContent>
          </Card>
        </>
      )}
    </CalculatorShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
        {title}
      </div>
      {children}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-primary">·</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
