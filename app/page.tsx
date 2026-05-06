import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Dumbbell,
  Flame,
  HeartPulse,
  Ruler,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  slug: string;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "live" | "soon";
  tier: 1 | 2 | 3 | 4;
}

const FEATURES: Feature[] = [
  // Tier 1 — calculators
  { slug: "/calculator/bmi", title: "BMI Calculator", blurb: "Body mass index with category and target ranges.", icon: Ruler, status: "live", tier: 1 },
  { slug: "/calculator/tdee", title: "TDEE & BMR", blurb: "Daily calorie burn from Mifflin-St Jeor + activity.", icon: Flame, status: "live", tier: 1 },
  { slug: "/calculator/macros", title: "Macro Calculator", blurb: "Protein / carbs / fat targets for cut, maintain, or bulk.", icon: Calculator, status: "live", tier: 1 },
  { slug: "/calculator/one-rep-max", title: "One Rep Max", blurb: "Epley + Brzycki, plus % tables for working sets.", icon: Dumbbell, status: "live", tier: 1 },
  { slug: "/calculator/body-fat", title: "Body Fat % (Navy)", blurb: "Tape-measure method. No scale required.", icon: HeartPulse, status: "live", tier: 1 },
  { slug: "/calculator/calories-burned", title: "Calories Burned", blurb: "MET-based estimate per activity and duration.", icon: Flame, status: "live", tier: 1 },
  { slug: "/calculator/water-intake", title: "Water Intake", blurb: "Daily hydration target from bodyweight + climate.", icon: HeartPulse, status: "live", tier: 1 },
  { slug: "/calculator/protein-intake", title: "Protein Intake", blurb: "g/kg recommendations by goal and training level.", icon: Calculator, status: "live", tier: 1 },
  { slug: "/calculator/ideal-weight", title: "Ideal Weight", blurb: "Devine, Robinson, Hamwi, BMI-range — all four.", icon: Ruler, status: "live", tier: 1 },
  { slug: "/calculator/lean-mass", title: "Lean Body Mass", blurb: "Boer, James, Hume formulas side-by-side.", icon: Ruler, status: "live", tier: 1 },
  { slug: "/calculator/pace", title: "Running Pace", blurb: "Pace ↔ time ↔ distance with split tables.", icon: Timer, status: "live", tier: 1 },
  { slug: "/calculator/heart-rate-zones", title: "Heart Rate Zones", blurb: "Karvonen 5-zone training prescriptions.", icon: HeartPulse, status: "live", tier: 1 },
  { slug: "/calculator/plate-loading", title: "Plate Loading", blurb: "Visual barbell — which plates per side.", icon: Dumbbell, status: "live", tier: 1 },
  { slug: "/calculator/wilks", title: "Wilks / DOTS", blurb: "Powerlifting relative-strength scores.", icon: Dumbbell, status: "live", tier: 1 },
  { slug: "/calculator/recomp-timeline", title: "Recomp Timeline", blurb: "Project weeks-to-goal from your deficit.", icon: Calculator, status: "live", tier: 1 },
  // Tier 2 — stateful tools
  { slug: "/tools/interval-timer", title: "Interval Timer", blurb: "Tabata, EMOM, AMRAP with audio cues.", icon: Timer, status: "live", tier: 2 },
  { slug: "/tools/rest-timer", title: "Rest + Set Logger", blurb: "Tap to log a set, auto-start rest, PR detection.", icon: Timer, status: "live", tier: 2 },
  { slug: "/library", title: "Exercise Library", blurb: "Foundational lifts with form cues, filter by muscle / gear.", icon: Dumbbell, status: "live", tier: 2 },
  { slug: "/programs", title: "Strength Programs", blurb: "5×5, PPL, Upper/Lower, 5/3/1 — printable.", icon: Sparkles, status: "live", tier: 2 },
  { slug: "/tools/overload", title: "Overload Tracker", blurb: "Log lifts, auto-suggest next session's load.", icon: Zap, status: "live", tier: 2 },
  // Tier 3 — AI
  { slug: "/ai/workout", title: "AI Workout Generator", blurb: "Goal + equipment + time → structured workout.", icon: Sparkles, status: "live", tier: 3 },
  { slug: "/ai/meal-plan", title: "AI Meal Plan", blurb: "Macro targets → 7-day plan + grocery list.", icon: Sparkles, status: "live", tier: 3 },
  { slug: "/ai/substitution", title: "AI Substitution", blurb: "Swap exercises by available equipment.", icon: Sparkles, status: "live", tier: 3 },
  { slug: "/ai/form-coach", title: "AI Form Coach", blurb: "Upload a photo, get cue-by-cue feedback.", icon: Sparkles, status: "live", tier: 3 },
  // Tier 4 — journal
  { slug: "/journal", title: "Workout Journal", blurb: "Log every session, track your streak. Local for now.", icon: Zap, status: "live", tier: 4 },
];

const TIER_LABELS: Record<Feature["tier"], string> = {
  1: "Tier 1 · Calculators",
  2: "Tier 2 · Tools",
  3: "Tier 3 · AI",
  4: "Tier 4 · Cloud",
};

export default function HomePage() {
  const grouped = (Object.keys(TIER_LABELS) as unknown as Feature["tier"][]).map(
    (t) => ({ tier: Number(t) as Feature["tier"], items: FEATURES.filter((f) => f.tier === Number(t)) }),
  );
  const liveCount = FEATURES.filter((f) => f.status === "live").length;

  return (
    <main className="min-h-dvh bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-grid-glow">
        <div className="container max-w-5xl py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3 w-3" />
              {liveCount} live · {FEATURES.length - liveCount} shipping soon
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-7xl">
              Every fitness calculator,{" "}
              <span className="bg-gradient-to-br from-primary to-emerald-300 bg-clip-text text-transparent">
                in one place.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              BMI, TDEE, macros, one-rep max, body fat — fast, accurate, no
              signup. Built for lifters, runners, and coaches who don&apos;t
              have time for ad-stuffed calculator sites.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/calculator/tdee"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
              >
                Try TDEE Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/calculator/one-rep-max"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background/50 px-6 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Calculate 1RM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container max-w-6xl py-16 sm:py-20">
        {grouped.map(({ tier, items }) => (
          <div key={tier} className="mb-14 last:mb-0">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {TIER_LABELS[tier]}
              </h2>
              <span className="text-xs text-muted-foreground">
                {items.filter((i) => i.status === "live").length}/{items.length}{" "}
                live
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => (
                <FeatureCard key={f.slug} feature={f} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-border/40">
        <div className="container max-w-6xl py-8 text-center text-sm text-muted-foreground">
          Built with Next.js 14 + Tailwind. Open source. Deployed on Vercel.
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const isLive = feature.status === "live";
  const Wrapper = isLive ? Link : "div";
  const wrapperProps = isLive ? { href: feature.slug } : {};

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 transition-all",
        isLive
          ? "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          : "opacity-60",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isLive
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {isLive ? (
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        ) : (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            soon
          </span>
        )}
      </div>
      <div>
        <div className="font-semibold">{feature.title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{feature.blurb}</div>
      </div>
    </Wrapper>
  );
}
