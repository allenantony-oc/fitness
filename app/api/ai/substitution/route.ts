import { NextResponse } from "next/server";
import { AnthropicConfigError, callClaude, extractJson } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  exercise: string;
  reason: string; // "no equipment X" / "joint pain" / "no space"
  available: string;
}

interface SubResponse {
  alternatives: { name: string; rationale: string; cue?: string }[];
}

const SYSTEM = `You are a strength coach. The user can't perform an exercise — give them three substitutions that hit the same muscle groups in the same way.

Output a strict JSON object — no prose, no markdown, no commentary:

interface Substitutions {
  alternatives: {
    name: string;        // exercise name
    rationale: string;   // 1 sentence: why this is a good swap (muscles, plane of motion, intensity)
    cue?: string;        // ONE concise form cue, optional
  }[];                   // exactly 3 alternatives, ranked best-first
}

Constraints:
- Each alternative must use only the equipment the user has access to.
- Match the original movement pattern (push/pull/hinge/squat/etc.) where possible.
- If a constraint makes an exact match impossible, explain the closest alternative.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.exercise) {
      return NextResponse.json({ error: "Missing exercise" }, { status: 400 });
    }
    const prompt = `Original exercise: ${body.exercise}
Why I can't do it: ${body.reason || "not specified"}
Equipment I do have: ${body.available || "bodyweight only"}

Give me 3 substitutions. Respond with ONLY the JSON object.`;
    const raw = await callClaude({
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 800,
    });
    const json = extractJson<SubResponse>(raw);
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
