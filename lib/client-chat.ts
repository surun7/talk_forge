"use client";

import { streamText, stepCountIs } from "ai";
import type { Resume } from "./resume-schema";
import { createDefaultResume } from "./resume-schema";
import { buildAllTools, setSectionOrderCallback, type ResumeStore } from "./resume-tools";
import { createCustomModel } from "./providers";
import { SYSTEM_PROMPT, DEFAULT_PROVIDER_URLS, type ChatEvent } from "./chat-constants";

export interface StreamChatParams {
  messages: { role: "user" | "assistant"; content: string }[];
  resume: Resume;
  sectionOrder: string[];
}

/**
 * Read the active provider config from localStorage.
 * Returns null if no provider is configured.
 */
function getProviderConfig(): {
  apiKey: string;
  baseURL: string;
  model: string;
  name: string;
} | null {
  try {
    const activeId = localStorage.getItem("talk_forge_api_active_provider");
    if (!activeId) return null;

    // Try built-in provider (kimi, minimax, glm, deepseek, mimo, openai, anthropic, google)
    const key = localStorage.getItem("talk_forge_api_" + activeId);
    if (key) {
      const model = localStorage.getItem("talk_forge_api_" + activeId + "_model") || "";
      const baseURL = DEFAULT_PROVIDER_URLS[activeId] || "";
      // For openai/anthropic/google that don't have a default URL here,
      // we need a baseURL for the proxy to work. If empty, the createOpenAI
      // SDK will use its default endpoint.
      return { apiKey: key, baseURL, model, name: activeId };
    }

    // Try custom provider
    const custom = localStorage.getItem("talk_forge_api_custom");
    if (custom) {
      const arr = JSON.parse(custom) as Array<{
        id: string;
        name: string;
        apiKey: string;
        baseURL: string;
        model: string;
      }>;
      const found = arr.find((p) => p.id === activeId);
      if (found) return found;
    }
  } catch {
    // localStorage unavailable or parse error
  }
  return null;
}

/**
 * Create a proxy-aware fetch that routes AI API requests through
 * /api/proxy to bypass CORS restrictions.
 *
 * The proxy is a pure HTTP forwarder — it does NOT store the API key
 * or any request/response data.
 */
function createProxyFetch(): typeof globalThis.fetch {
  return async (url, init) => {
    const targetUrl = typeof url === "string" ? url : url instanceof URL ? url.href : String(url);

    // Convert headers to plain object (AI SDK may pass Headers object)
    const headerObj: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headerObj[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        for (const [key, value] of init.headers) {
          headerObj[key] = value;
        }
      } else {
        Object.assign(headerObj, init.headers as Record<string, string>);
      }
    }

    // Body may be string or other — convert to string for JSON transport
    let bodyStr: string | undefined;
    if (init?.body) {
      if (typeof init.body === "string") {
        bodyStr = init.body;
      } else {
        // Shouldn't normally happen for AI SDK, but handle it
        bodyStr = JSON.stringify(init.body);
      }
    }

    // Route through our CORS proxy
    const proxyResponse = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        method: init?.method || "POST",
        headers: headerObj,
        body: bodyStr,
      }),
    });

    // If proxy returned an error, read the body so AI SDK can parse the error message
    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      return new Response(errorText, {
        status: proxyResponse.status,
        headers: { "Content-Type": proxyResponse.headers.get("content-type") || "application/json" },
      });
    }

    return proxyResponse;
  };
}

/**
 * Stream a chat completion from the browser, executing all tools locally.
 *
 * This function:
 * 1. Reads the API key from localStorage (never from server)
 * 2. Creates a model that routes through /api/proxy for CORS bypass
 * 3. Runs streamText with all resume tools (executed in browser memory)
 * 4. Yields ChatEvent objects compatible with the existing UI
 *
 * The API key passes through the proxy server's memory but is NEVER stored
 * on the server — the proxy is a pure HTTP forwarder.
 */
export async function* streamChat(params: StreamChatParams): AsyncGenerator<ChatEvent> {
  const { messages, resume, sectionOrder } = params;

  const config = getProviderConfig();
  if (!config || !config.apiKey) {
    yield { type: "error", error: "No API provider configured. Add a provider in Dashboard → API Settings." };
    return;
  }

  if (!config.model) {
    yield { type: "error", error: "No model specified. Please set a model in API Settings." };
    return;
  }

  // Set up the resume store and tools (all run in browser memory)
  const store: ResumeStore = { current: resume ?? createDefaultResume() };
  const sectionOrderState = { current: sectionOrder };
  setSectionOrderCallback((order: string[]) => {
    sectionOrderState.current = order;
  });
  const tools = buildAllTools(store);

  // Create model with proxy fetch for CORS bypass
  const proxyFetch = createProxyFetch();
  const model = createCustomModel(
    { id: "client", name: config.name, apiKey: config.apiKey, baseURL: config.baseURL, model: config.model },
    proxyFetch,
  );

  try {
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      stopWhen: stepCountIs(10),
    });

    for await (const part of result.fullStream) {
      switch (part.type) {
        case "tool-call":
          yield { type: "tooling", action: part.toolName };
          break;
        case "text-delta":
          yield { type: "text", text: part.text };
          break;
        case "error":
          yield {
            type: "error",
            error: typeof part.error === "string"
              ? part.error
              : part.error instanceof Error
                ? part.error.message
                : "Stream error",
          };
          break;
        default:
          // start, finish, tool-result, etc. — ignore
          break;
      }
    }

    yield {
      type: "resume",
      resume: store.current,
      sectionOrder: sectionOrderState.current,
    };
    yield { type: "done" };
  } catch (err) {
    yield {
      type: "error",
      error: err instanceof Error ? err.message : "Stream error",
    };
  }
}
