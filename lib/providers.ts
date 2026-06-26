import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type ProviderId = "openai" | "anthropic" | "google" | "groq" | "custom";

export const BUILTIN_LABELS: Record<string, string> = {
  openai: "OpenAI (GPT-4o)",
  anthropic: "Anthropic (Claude)",
  google: "Google (Gemini)",
  groq: "Groq (Llama 3)",
};

const MODEL_IDS = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-6",
  google: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
} as const;

export interface CustomProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * Create a patched fetch that injects `reasoning_content: ""` into assistant
 * tool-call messages when targeting Kimi (Moonshot) API endpoints.
 *
 * Kimi requires reasoning_content in assistant tool-call messages when thinking
 * is enabled. The AI SDK doesn't preserve reasoning_content across turns, causing:
 * "thinking is enabled but reasoning_content is missing in assistant tool call
 * message at index N". This patch fixes that.
 *
 * Safe to use in both browser and Node.js — only wraps globalThis.fetch.
 *
 * @param baseFetch - The underlying fetch to wrap (defaults to globalThis.fetch)
 */
export function createPatchedFetch(baseFetch: typeof globalThis.fetch = globalThis.fetch): typeof globalThis.fetch {
  return async (url, init) => {
    // Only patch requests to Kimi (Moonshot) API endpoints
    const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : String(url);
    const isKimiEndpoint = urlStr.includes("api.moonshot.cn") || urlStr.includes("moonshot");
    if (isKimiEndpoint && init?.body && typeof init.body === "string") {
      try {
        const body = JSON.parse(init.body);
        if (body.messages && Array.isArray(body.messages)) {
          body.messages = body.messages.map((msg: Record<string, unknown>) => {
            if (
              msg.role === "assistant" &&
              msg.tool_calls &&
              !("reasoning_content" in msg)
            ) {
              return { ...msg, reasoning_content: "" };
            }
            return msg;
          });
        }
        init = { ...init, body: JSON.stringify(body) };
      } catch {
        // body isn't JSON or doesn't have messages — leave it alone
      }
    }
    return baseFetch(url, init);
  };
}

/**
 * Create a LanguageModel for a custom OpenAI-compatible provider.
 * Works in both browser and server — does NOT read process.env.
 *
 * @param config - Provider config with apiKey, baseURL, model
 * @param customFetch - Optional custom fetch (e.g. proxy fetch for CORS bypass)
 */
export function createCustomModel(
  config: CustomProviderConfig,
  customFetch?: typeof globalThis.fetch,
): LanguageModel {
  const fetchFn = customFetch
    ? createPatchedFetch(customFetch)
    : createPatchedFetch();

  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    fetch: fetchFn,
  }).chat(config.model);
}

/**
 * Server-side model creation — reads API keys from environment variables.
 * Only works in Node.js (route handlers), not in the browser.
 */
export function getModel(provider: ProviderId, custom?: CustomProviderConfig): LanguageModel | null {
  if (provider === "custom" && custom) {
    return createCustomModel(custom);
  }

  switch (provider) {
    case "openai": {
      if (!process.env.OPENAI_API_KEY) return null;
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(MODEL_IDS.openai);
    }
    case "anthropic": {
      if (!process.env.ANTHROPIC_API_KEY) return null;
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(MODEL_IDS.anthropic);
    }
    case "google": {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
      return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })(MODEL_IDS.google);
    }
    case "groq": {
      if (!process.env.GROQ_API_KEY) return null;
      return createGroq({ apiKey: process.env.GROQ_API_KEY })(MODEL_IDS.groq);
    }
    default:
      return null;
  }
}

export function getAvailableProviders(): ProviderId[] {
  const available: ProviderId[] = [];
  if (process.env.OPENAI_API_KEY) available.push("openai");
  if (process.env.ANTHROPIC_API_KEY) available.push("anthropic");
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) available.push("google");
  if (process.env.GROQ_API_KEY) available.push("groq");
  return available;
}
