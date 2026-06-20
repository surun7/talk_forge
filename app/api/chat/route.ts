import { streamText, stepCountIs } from "ai";
import { getModel } from "@/lib/providers";
import { getCustomProvider, getSafeProviderList } from "@/lib/custom-providers-store";
import { buildAllTools, setSectionOrderCallback } from "@/lib/resume-tools";
import { createDefaultResume, type Resume } from "@/lib/resume-schema";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a resume-building assistant. You MUST call the appropriate tool to make changes to the user's resume.

CRITICAL: You have access to tools. When the user asks you to add, update, or delete something, you MUST call the relevant tool. DO NOT just say "Done" without calling a tool. The tools are your only way to modify the resume.

RULES:
1. When the user asks for a change: call the tool FIRST, then respond with a brief confirmation (e.g. "Added experience at Google.").
1a. To rename a section (e.g. "change projects to Academic Projects"), use renameSection.
1b. To reorder sections (e.g. "move overview after experience"), use reorderSections with the full desired order array. Get section keys from listItems first.
2. When the user asks a question: call listItems first, then answer.
3. If you need to update or delete and don't know the ID: call listItems first.
4. Links (LinkedIn, GitHub, portfolio, etc.) are managed with addLink/removeLink tools — do NOT include links in updateBasics.
5. Profile photo is managed with updatePhoto tool — do NOT include photo in updateBasics.
6. Keep confirmation responses to 1 short sentence. Never show code or JSON.`;

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
  resume: z.any().optional(),
  sectionOrder: z.array(z.string()).optional(),
  providerConfig: providerConfigSchema,
});

export async function POST(req: Request) {
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
    if (customList.length > 0) {
      const customConfig = getCustomProvider(customList[0].id);
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

  console.log(`[chat] Using provider: ${providerName}`);

  const store = { current: (resume as Resume) ?? createDefaultResume() };
  const tools = buildAllTools(store);

  const historyMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const lastMsg = historyMessages[historyMessages.length - 1];
  console.log(`[chat] Last message: "${lastMsg?.content?.slice(0, 80)}..."`);

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
              console.log(`[chat] Tool call: ${part.toolName}(${JSON.stringify(part.input)})`);
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
              console.log(`[chat] Tool result: ${JSON.stringify(part.output).slice(0, 100)}`);
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

        console.log(`[chat] Done. Tools called: ${toolCallsSeen}`);

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
