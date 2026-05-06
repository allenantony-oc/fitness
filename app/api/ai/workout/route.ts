import { NextResponse } from "next/server";
import { AnthropicConfigError, callClaude, extractJson } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  goal: string;
  equipment: string;
  minutes: number;
  experience: string;
}

interface WorkoutResponse {
  name: string;
  warmup: string[];
  blocks: {
    title: string;
    exercises: { name: string; sets: string; reps: string; rest: string; cue?: string }[];
  }[];
  cooldown: string[];
  notes: string;
}

const SYSTEM = `You are an expert strength and conditioning coach. Given a goal, available equipment, time budget, and experience level, design ONE workout.

Output a strict JSON object that matches this TypeScript interface — no prose, no markdown, no commentary:

interface Workout {
  name: string;             // 4–8 word title
  warmup: string[];         // 3–5 bullet items, e.g. "5 min row, easy pace"
  blocks: {                 // 1–4 blocks, each a logical group
    title: string;          // e.g. "Strength A1+A2 superset"
    exercises: {
      name: string;
      sets: string;         // e.g. "4"
      reps: string;         // e.g. "5–8" or "30s on / 30s off"
      rest: string;         // e.g. "90s"
      cue?: string;         // ONE concise form cue, optional
    }[];
  }[];
  cooldown: string[];       // 2–4 bullet items
  notes: string;            // 1–2 sentences on intent and progression
}

Constraints:
- Only use the equipment provided.
- Total session length must fit within the time budget (warmup + main + cooldown).
- Match the experience level — beginners get fewer movements and clearer cues.
- Prioritise compound lifts.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.goal || !body.equipment || !body.minutes) {
      return NextResponse.json(
        { error: "Missing fields: goal, equipment, minutes" },
        { status: 400 },
      );
    }
    const prompt = `Goal: ${body.goal}
Equipment available: ${body.equipment}
Time budget: ${body.minutes} minutes
Experience level: ${body.experience || "intermediate"}

Design the workout now. Respond with ONLY the JSON object.`;
    const raw = await callClaude({
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1500,
    });
    const json = extractJson<WorkoutResponse>(raw);
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
