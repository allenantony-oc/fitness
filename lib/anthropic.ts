// Minimal Anthropic Messages API wrapper using fetch — no SDK dependency.
// Supports text + vision content blocks. Returns structured JSON or throws.

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ImageBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    data: string;
  };
}

export type ContentBlock = TextBlock | ImageBlock;

export interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface CallOptions {
  system: string;
  messages: Message[];
  maxTokens?: number;
  model?: string;
}

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export class AnthropicConfigError extends Error {
  constructor() {
    super(
      "ANTHROPIC_API_KEY is not set. Configure it in your Vercel project settings to enable AI features.",
    );
    this.name = "AnthropicConfigError";
  }
}

export async function callClaude(opts: CallOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AnthropicConfigError();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      // Cache the system prompt — reused across requests on each AI feature.
      system: [
        {
          type: "text",
          text: opts.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errBody}`);
  }

  const json = (await res.json()) as {
    content: { type: string; text?: string }[];
  };
  return json.content
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n");
}

// Strip ```json fences if the model wraps the output.
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) text = fence[1].trim();
  return JSON.parse(text) as T;
}
