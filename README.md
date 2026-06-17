# Talk Forge

A **pluggable AI-powered resume builder framework** with real-time A4 preview and pixel-perfect PDF export. Connect any OpenAI-compatible model (Kimi, GPT, Claude, DeepSeek, Ollama, etc.) or use it entirely offline as a standalone resume editor.

Agent Mode:
<img width="2558" height="1293" alt="屏幕截图 2026-06-17 232311" src="https://github.com/user-attachments/assets/b5219721-3615-4b06-b84b-26db1aee8b3c" />

Manual Mode:
<img width="2558" height="1286" alt="屏幕截图 2026-06-17 234229" src="https://github.com/user-attachments/assets/cbccd0f8-b1a2-4f1d-9d71-5a81b2b96df8" />

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 + TypeScript 5 + Tailwind CSS 4
- **AI Layer**: Vercel AI SDK v6 (supports any OpenAI-compatible API endpoint)
- **PDF Generation**: html2canvas-pro + jsPDF (pixel-level A4 pagination at 3x scale)
- **State Management**: React Hooks + localStorage (multi-project isolation with auto-save)
- **Fonts**: 16 fonts served locally as TTF files (no Google Fonts CDN dependency)

## Core Features

- 🤖 **AI Conversational Editing (Optional)**: Describe changes in natural language and the AI invokes tools to modify your resume. Fully degrades to manual mode when no API keys are configured.
- 📝 **Manual Fine-Grained Editing**: Rich text editor (bold, italic, underline, unordered/ordered lists), section reordering with drag-free move buttons, Undo/Redo with Ctrl+Z/Y
- 📄 **A4 Standard PDF Export**: Preview frame and downloaded file are 1:1 identical, with 16 fonts and 12 theme colors
- 🎨 **16 Fonts + Multi-Theme**: Lora, Inter, Montserrat, Merriweather, and 12 more. Fonts load locally — zero external CDN requests after first page load.
- 📂 **Project Management**: Dashboard-based multi-resume management. Auto-save every 800ms, conversation history persists per project.
- 🔌 **Pluggable Models**: Four built-in providers (OpenAI, Anthropic, Google, Groq) plus unlimited custom providers via `CUSTOM_PROVIDERS_JSON` environment variable. Custom providers managed server-side only — API keys never reach the browser.

## Local Development

```bash
# 1. Clone
git clone https://github.com/surun7/talk-forge.git
cd talk-forge

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional — manual mode works without AI)
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start dev server
npm run dev
```

## Environment Variables (Optional)

If no API keys are configured, Talk Forge runs as a pure local resume editor with all features (manual editing, PDF export, project management) fully functional.

```env
# Built-in providers (set any or all):
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
GROQ_API_KEY=...

# Custom providers (JSON array, server-side only):
# CUSTOM_PROVIDERS_JSON=[{"id":"kimi","name":"Kimi","apiKey":"sk-...","baseURL":"https://api.moonshot.cn/v1","model":"moonshot-v1-8k"}]
```

Custom provider keys are stored **only on the server** — they are never sent to the browser. You can also add/remove custom providers at runtime via the gear icon in the chat panel (keys stored in browser localStorage in that case).

## Project Structure

```
app/
├── page.tsx                    # Dashboard (project overview + management)
├── editor/
│   └── page.tsx                # Resume editor with undo/redo + auto-save
├── api/
│   └── chat/
│       └── route.ts            # AI chat SSE endpoint
├── styles/
│   └── fonts.css               # Local @font-face definitions (16 fonts)
├── globals.css                 # Tailwind v4 + theme tokens

components/
├── toolbar.tsx                 # Top toolbar (undo/redo, font, color, download)
├── chat-panel.tsx              # AI chat panel (multi-conversation, SSE streaming)
├── resume-preview.tsx          # A4 preview frame with automatic pagination
├── photo-upload-modal.tsx      # Photo crop/upload modal
├── editor/
│   ├── manual-editor.tsx       # Manual editing panel (section order)
│   ├── shared.tsx              # Shared components (SectionHeader, FormattedField, etc.)
│   ├── section-render-map.tsx  # Section component registry
│   └── sections/               # 12 section components (basics, experience, etc.)

hooks/
├── use-project.ts              # Project loading + 800ms debounced auto-save
└── use-resume-pdf.ts           # PDF generation (html2canvas-pro 3x scale)

lib/
├── storage.ts                  # localStorage adapter (cloud interface reserved)
├── auth.ts                     # Auth placeholder (cloud login stubs)
├── resume-schema.ts            # Zod v4 schemas + types + template data
├── resume-tools.ts             # Vercel AI SDK tool definitions
├── providers.ts                # AI provider setup (OpenAI, Anthropic, Google, Groq)
├── custom-providers-store.ts   # Runtime custom provider management
└── use-resume-pdf.ts           # PDF generation hook

public/
├── fonts/                      # 16 font families as local TTF files
│   ├── lora/
│   ├── inter/
│   ├── montserrat/
│   └── ... (13 more)
```

## Model Integration

Talk Forge does not bundle any AI model. It connects to external APIs through Vercel AI SDK. You can configure multiple providers via environment variables or runtime custom providers.

Built-in support for:
- **OpenAI** (`OPENAI_API_KEY`)
- **Anthropic Claude** (`ANTHROPIC_API_KEY`)
- **Google Gemini** (`GOOGLE_GENERATIVE_AI_API_KEY`)
- **Groq** (`GROQ_API_KEY`)

For any other OpenAI-compatible endpoint (Kimi, DeepSeek, Ollama, vLLM, etc.), use `CUSTOM_PROVIDERS_JSON`.

When no AI environment variables are configured, the app automatically hides the chat panel and shows only the manual editing interface.

## License

MIT
