import { NextResponse } from "next/server";
import { AnthropicConfigError, callClaude, extractJson } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FormResponse {
  exercise: string;
  overall: string;
  goodCues: string[];
  fixes: { issue: string; fix: string }[];
  nextStep: string;
}

const SYSTEM = `You are a strength coach reviewing a still photo of someone performing an exercise.

Output a strict JSON object — no prose, no markdown:

interface FormReview {
  exercise: string;        // the exercise you see
  overall: string;         // 1–2 sentences: overall assessment
  goodCues: string[];      // 1–3 things they're doing well
  fixes: {
    issue: string;         // specific form fault you see
    fix: string;           // the cue to address it
  }[];                     // 1–4 fixes ranked by safety/impact
  nextStep: string;        // 1 sentence: what to focus on first
}

Constraints:
- Be specific. Reference body parts, joint angles, and bar/load position.
- Be honest about safety risks (e.g. lumbar flexion under load).
- If the image isn't clear enough or isn't an exercise, say so in "overall" and return empty arrays.
- No medical advice; defer to a coach or doctor for pain or injury.`;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const note = (formData.get("note") as string) || "";
    if (!file) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${file.type}. Use JPEG, PNG, WebP, or GIF.` },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 5 MB)." },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const userText = note
      ? `Additional context from the lifter: ${note}\n\nReview the form. Respond with ONLY the JSON object.`
      : "Review the form in this image. Respond with ONLY the JSON object.";

    const raw = await callClaude({
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as AllowedType,
                data: base64,
              },
            },
            { type: "text", text: userText },
          ],
        },
      ],
      maxTokens: 1500,
    });
    const json = extractJson<FormResponse>(raw);
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
