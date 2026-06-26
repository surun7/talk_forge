/**
 * @deprecated This route has been superseded by the browser-direct architecture.
 *
 * The chat flow now runs entirely in the browser via lib/client-chat.ts:
 *   - streamText() and all tool execution happen client-side
 *   - AI API requests are forwarded through /api/proxy (pure CORS proxy)
 *   - API keys NEVER touch the server's persistent storage
 *
 * This route is kept as a fallback but is no longer called by the UI.
 * It can be safely deleted once the new architecture is confirmed stable.
 */

import { streamText, stepCountIs } from "ai";
import { getModel } from "@/lib/providers";
import { getCustomProvider, getSafeProviderList } from "@/lib/custom-providers-store";
import { buildAllTools, setSectionOrderCallback } from "@/lib/resume-tools";
import { createDefaultResume, resumeSchema, type Resume } from "@/lib/resume-schema";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/chat-constants";

// ── Simple in-memory rate limiter ──
interface RateLimitEntry {
  tokens: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { tokens: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.tokens--;
  return entry.tokens < 0;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

const providerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKey: z.string(),
  baseURL: z.string(),
  model: z.string(),
}).optional();

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  resume: resumeSchema.optional(),
  sectionOrder: z.array(z.string()).optional(),
  providerConfig: providerConfigSchema,
});

export async function POST(req: Request) {
  // Rate limiting by IP
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { messages, resume, sectionOrder: initialOrder, providerConfig } = parsed.data;
  const sectionOrderState = { current: initialOrder || [] };
  setSectionOrderCallback((order: string[]) => { sectionOrderState.current = order; });

  // Priority: client-provided config > env var CUSTOM_PROVIDERS_JSON
  let model = null;
  let providerName = "";

  if (providerConfig && providerConfig.apiKey) {
    model = getModel("custom", providerConfig);
    providerName = `${providerConfig.name} (${providerConfig.model})`;
  } else {
    const customList = getSafeProviderList();
    const firstProvider = customList[0];
    if (firstProvider) {
      const customConfig = getCustomProvider(firstProvider.id);
      if (customConfig) {
        model = getModel("custom", customConfig);
        providerName = `${customConfig.name} (${customConfig.model})`;
      }
    }
  }

  if (!model) {
    return Response.json(
      { error: "No API provider configured. Add a provider in Dashboard → API Settings, or set CUSTOM_PROVIDERS_JSON in .env.local." },
      { status: 400 }
    );
  }

  const store = { current: resume ?? createDefaultResume() };
  const tools = buildAllTools(store);

  const historyMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const lastMsg = historyMessages[historyMessages.length - 1];

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: historyMessages,
    tools,
    stopWhen: stepCountIs(10),
  });

  const encoder = new TextEncoder();
  let toolCallsSeen = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const fullStream = result.fullStream;

        for await (const part of fullStream) {
          switch (part.type) {
            case "tool-call": {
              toolCallsSeen++;
              // Send heartbeat so the client knows the stream is alive during
              // long sequences of tool calls (no text-deltas while tools run).
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({ type: "tooling", action: part.toolName }) + "\n"
                )
              );
              break;
            }
            case "tool-result": {
              break;
            }
            case "text-delta": {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: "text", text: part.text }) + "\n")
              );
              break;
            }
            case "error": {
              console.error(`[chat] Stream error part:`, part.error);
              break;
            }
            default:
              // start, finish, etc. — ignore
              break;
          }
        }

        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "resume", resume: store.current, sectionOrder: sectionOrderState.current }) + "\n"
          )
        );
        controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
        controller.close();
      } catch (err) {
        console.error("[chat] Stream error:", err);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: err instanceof Error ? err.message : "Stream error",
            }) + "\n"
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
