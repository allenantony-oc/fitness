import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
