"use client";

import { useState } from "react";
import { Sparkles, Loader2, Repeat } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Sub {
  alternatives: { name: string; rationale: string; cue?: string }[];
}

export default function SubstitutionPage() {
  const [exercise, setExercise] = useState("Barbell Back Squat");
  const [reason, setReason] = useState("no squat rack at the hotel gym");
  const [available, setAvailable] = useState("Dumbbells up to 50 lb, bench, treadmill");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Sub | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/substitution", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exercise, reason, available }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
      } else {
        setResult(json as Sub);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CalculatorShell
      title="AI Exercise Substitution"
      tagline="Can't do an exercise? Get three swaps that hit the same muscles with the gear you have."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label>Exercise to replace</Label>
            <Input
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Why you can&apos;t do it</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Equipment you do have</Label>
            <Input
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
            />
          </div>
          <Button size="lg" className="w-full" onClick={generate} disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Thinking…" : "Find substitutions"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-rose-500/40 bg-rose-500/5">
          <CardContent className="pt-6 text-sm text-rose-300">{error}</CardContent>
        </Card>
      )}

      {result?.alternatives.map((a, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Repeat className="h-4 w-4 text-primary" />
                  {a.name}
                </div>
                <div className="text-sm text-muted-foreground">{a.rationale}</div>
                {a.cue && (
                  <div className="text-xs italic text-muted-foreground">
                    Cue: {a.cue}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </CalculatorShell>
  );
}
