"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalculatorShellProps {
  title: string;
  tagline: string;
  children: React.ReactNode;
  className?: string;
}

export function CalculatorShell({
  title,
  tagline,
  children,
  className,
}: CalculatorShellProps) {
  return (
    <main className="min-h-dvh bg-background bg-grid-glow">
      <div className="container max-w-3xl py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All calculators
        </Link>
        <header className="mb-8 space-y-3">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="text-balance text-lg text-muted-foreground">{tagline}</p>
        </header>
        <div className={cn("space-y-6", className)}>{children}</div>
      </div>
    </main>
  );
}

export function ResultActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [text]);

  const share = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    copy();
  }, [text, copy]);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
    </div>
  );
}

export function StatPill({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5",
        accent && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {hint ? (
        <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
