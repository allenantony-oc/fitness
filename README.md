# Fitstack

Fast, accurate fitness calculators. Next.js 14 (App Router) + Tailwind + a hand-rolled shadcn-style UI layer. No database, no auth — just pure client-side math, statically prerendered for instant loads and SEO.

## Live features (all 25)

**Tier 1 · Calculators** — pure client-side math, statically prerendered:
`/calculator/bmi`, `tdee`, `macros`, `one-rep-max`, `body-fat`,
`calories-burned`, `water-intake`, `protein-intake`, `ideal-weight`,
`lean-mass`, `pace`, `heart-rate-zones`, `plate-loading`, `wilks`,
`recomp-timeline`.

**Tier 2 · Tools** — stateful, localStorage-backed:
`/tools/interval-timer`, `/tools/rest-timer`, `/tools/overload`,
`/library`, `/programs`.

**Tier 3 · AI** (require `ANTHROPIC_API_KEY` env var, see below):
`/ai/workout`, `/ai/meal-plan`, `/ai/substitution`, `/ai/form-coach` (vision).

**Tier 4 · Journal** — localStorage workout log + streak tracking:
`/journal`. Cloud sync deferred.

## AI features setup

The four `/ai/*` routes call Anthropic's Messages API. They degrade
gracefully — the page loads and shows a helpful error if the key is
missing. To enable:

1. Get an API key from https://console.anthropic.com
2. In Vercel: Project → Settings → Environment Variables → add
   `ANTHROPIC_API_KEY`
3. Redeploy (or just push a commit)

Locally: create `.env.local` with `ANTHROPIC_API_KEY=sk-ant-…` and
restart `npm run dev`.

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the build
```

Node 18.17+ required (project tested on 18.19).

## Deploy to Vercel via GitHub

```bash
# 1. Initialize and push
git init
git add -A
git commit -m "Initial scaffold + 5 calculators"
git branch -M main
git remote add origin git@github.com:<you>/fitness.git
git push -u origin main

# 2. Import on Vercel
#    - Visit https://vercel.com/new
#    - Pick the GitHub repo
#    - Framework: Next.js (auto-detected)
#    - Build command: next build (default)
#    - Install command: npm install (default)
#    - Click Deploy
```

Every push to `main` redeploys production. Pushes to other branches get preview URLs automatically. No `vercel.json` needed.

## Project layout

```
app/
  layout.tsx              # root layout, dark theme, metadata
  page.tsx                # hero + 25-feature grid
  globals.css             # Tailwind + CSS variables
  calculator/
    bmi/page.tsx
    tdee/page.tsx
    macros/page.tsx
    one-rep-max/page.tsx
    body-fat/page.tsx
components/
  ui/                     # button, input, label, card primitives
  calculator-shell.tsx    # shared page chrome + StatPill
  unit-toggle.tsx         # metric/imperial pill switch
lib/
  calculators.ts          # all pure math (BMI, BMR, macros, 1RM, body fat)
  utils.ts                # cn() class merger
```

All calculator pages are client components — they need React state for live recalculation. The pages still prerender their static markup at build time and hydrate on load.

## Adding a new calculator

1. Add the pure function to `lib/calculators.ts` (keep it pure, metric inputs).
2. Create `app/calculator/<slug>/page.tsx` — copy the structure from `bmi/page.tsx`.
3. Wrap UI in `<CalculatorShell title=... tagline=...>`.
4. Use `<StatPill accent />` for the headline result.
5. Flip the matching entry in `app/page.tsx` from `status: "soon"` to `status: "live"`.

Tier 1 calculators should ship in under 2 hours each.

## Roadmap (in order, lowest-complexity-highest-impact first)

See the homepage. 5 of 25 are live. Next up: Calories Burned, Water Intake, Protein Intake, Ideal Weight, Lean Mass, Pace, Heart Rate Zones, Plate Loading, Wilks/DOTS, Recomp Timeline. Then Tier 2 stateful tools, then AI features (Vercel AI SDK + Claude), then optional cloud journal (Supabase).
