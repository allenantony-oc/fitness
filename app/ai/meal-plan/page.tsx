"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { CalculatorShell } from "@/components/calculator-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MealPlan {
  summary: string;
  days: {
    day: string;
    meals: { name: string; foods: string[]; kcal: number; proteinG: number }[];
    totals: { kcal: number; proteinG: number };
  }[];
  groceryList: string[];
}

export default function MealPlanPage() {
  const [calories, setCalories] = useState("2400");
  const [protein, setProtein] = useState("180");
  const [meals, setMeals] = useState("4");
  const [diet, setDiet] = useState("no restrictions");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setOpenDay(null);
    try {
      const res = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          calories: parseInt(calories, 10),
          protein: parseInt(protein, 10),
          meals: parseInt(meals, 10),
          diet,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
      } else {
        const plan = json as MealPlan;
        setResult(plan);
        setOpenDay(plan.days[0]?.day ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CalculatorShell
      title="AI Meal Plan Generator"
      tagline="A 7-day plan that hits your calorie and protein targets, with a consolidated grocery list."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily calories</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Daily protein (g)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meals per day</Label>
              <select
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dietary preference</Label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="no restrictions">No restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="keto / low-carb">Keto / low-carb</option>
              </select>
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={generate} disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Building plan…" : "Generate 7-day plan"}
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
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {result.summary}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {result.days.map((d) => {
              const isOpen = openDay === d.day;
              return (
                <Card key={d.day}>
                  <CardContent className="pt-6">
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? null : d.day)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <div className="font-semibold">{d.day}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.totals.kcal.toLocaleString()} kcal · {d.totals.proteinG} g protein
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {isOpen ? "Hide" : "Show"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-4 space-y-3">
                        {d.meals.map((m, i) => (
                          <div
                            key={i}
                            className="rounded-md border border-border/40 bg-card/50 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">{m.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {m.kcal} kcal · {m.proteinG}g P
                              </div>
                            </div>
                            <ul className="mt-2 space-y-1 text-sm">
                              {m.foods.map((f, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-primary">·</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Grocery list
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                {result.groceryList.map((g, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-border/30 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                  >
                    <input type="checkbox" className="h-3.5 w-3.5 accent-primary" />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </CalculatorShell>
  );
}
