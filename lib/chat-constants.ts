/**
 * Shared chat constants — used by both client-side chat and legacy server route.
 */

export const SYSTEM_PROMPT = `You are a resume-building assistant. You MUST call the appropriate tool to make changes to the user's resume.

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

/** Default base URLs for built-in OpenAI-compatible providers. */
export const DEFAULT_PROVIDER_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta/openai",
  kimi: "https://api.moonshot.cn/v1",
  minimax: "https://api.minimax.chat/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
  deepseek: "https://api.deepseek.com/v1",
  mimo: "https://api.xiaomimimo.com/v1",
};

/** Chat event types emitted by streamChat (compatible with existing UI). */
export type ChatEvent =
  | { type: "tooling"; action: string }
  | { type: "text"; text: string }
  | { type: "resume"; resume: unknown; sectionOrder: string[] }
  | { type: "done" }
  | { type: "error"; error: string };
