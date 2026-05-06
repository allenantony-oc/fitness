import { NextResponse } from "next/server";
import { AnthropicConfigError, callClaude, extractJson } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  calories: number;
  protein: number;
  diet: string;
  meals: number;
}

interface MealPlanResponse {
  summary: string;
  days: {
    day: string;
    meals: { name: string; foods: string[]; kcal: number; proteinG: number }[];
    totals: { kcal: number; proteinG: number };
  }[];
  groceryList: string[];
}

const SYSTEM = `You are a registered dietitian. Build a 7-day meal plan that hits the daily calorie and protein targets.

Output a strict JSON object — no prose, no markdown, no commentary:

interface MealPlan {
  summary: string;        // 1–2 sentences on the plan's approach
  days: {
    day: string;          // "Monday" through "Sunday"
    meals: {
      name: string;       // e.g. "Breakfast", "Lunch", "Snack"
      foods: string[];    // 2–4 specific foods with quantities, e.g. "150g grilled chicken breast"
      kcal: number;
      proteinG: number;
    }[];
    totals: { kcal: number; proteinG: number };
  }[];                    // exactly 7 days
  groceryList: string[];  // consolidated weekly shopping list, ~15–25 items
}

Constraints:
- Hit calorie target ±100 kcal per day. Hit protein target ±10g per day.
- Honor the dietary restriction strictly.
- Use the requested number of meals per day.
- Real, common ingredients. No fancy or hard-to-find items.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.calories || !body.protein) {
      return NextResponse.json(
        { error: "Missing fields: calories, protein" },
        { status: 400 },
      );
    }
    const prompt = `Daily targets: ${body.calories} kcal, ${body.protein}g protein
Meals per day: ${body.meals || 4}
Dietary preference: ${body.diet || "no restrictions"}

Build the 7-day plan. Respond with ONLY the JSON object.`;
    const raw = await callClaude({
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 4000,
    });
    const json = extractJson<MealPlanResponse>(raw);
    return NextResponse.json(json);
  } catch (e) {
    if (e instanceof AnthropicConfigError) {
      return NextResponse.json({ error: e.message, kind: "config" }, { status: 503 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
