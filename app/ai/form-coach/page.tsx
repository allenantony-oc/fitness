"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2, Upload, X, Check, AlertCircle } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormReview {
  exercise: string;
  overall: string;
  goodCues: string[];
  fixes: { issue: string; fix: string }[];
  nextStep: string;
}

export default function FormCoachPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  async function review() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("note", note);
      const res = await fetch("/api/ai/form-coach", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
      } else {
        setResult(json as FormReview);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CalculatorShell
      title="AI Form Coach"
      tagline="Upload a still photo of any lift. Claude returns specific cues and fixes."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label>Photo of your lift (mid-rep is best)</Label>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Selected lift"
                  className="max-h-96 w-full rounded-md border border-border/60 object-contain"
                />
                <button
                  onClick={() => pickFile(null)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur hover:text-foreground"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border/60 bg-card/50 p-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Upload className="h-6 w-6" />
                Click to upload an image (max 5 MB)
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Optional context</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. last set of 5, working weight, lower-back tweak"
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={review}
            disabled={loading || !file}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Reviewing…" : "Review form"}
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
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {result.exercise || "Exercise"}
              </div>
              <p className="text-sm">{result.overall}</p>
            </CardContent>
          </Card>

          {result.goodCues.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  Doing well
                </div>
                <ul className="space-y-2 text-sm">
                  {result.goodCues.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.fixes.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">
                  Fix these
                </div>
                <div className="space-y-3">
                  {result.fixes.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border/40 bg-card/50 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{f.issue}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Cue:</span> {f.fix}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.nextStep && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Focus next session on
                </div>
                <div className="mt-1 text-sm font-medium">{result.nextStep}</div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </CalculatorShell>
  );
}
