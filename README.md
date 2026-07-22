# Talk Forge

<p align="center">
  <a href="https://www.talkforge.cc" target="_blank"><strong>🌐 www.talkforge.cc</strong></a>
  <br />
  <sub>Try it online — no install required.</sub>
</p>

A **pluggable AI-powered resume builder framework** with real-time A4 preview and pixel-perfect PDF export. Connect any OpenAI-compatible model or use it entirely offline as a standalone resume editor.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 + TypeScript 5 + Tailwind CSS 4
- **AI Layer**: Vercel AI SDK v6 (browser-direct execution with CORS proxy)
- **PDF Generation**: html2canvas-pro + jsPDF (pixel-level A4 pagination at 3x scale)
- **State Management**: React Hooks + localStorage (multi-project isolation with auto-save)
- **Fonts**: 16 fonts served locally as TTF files (no Google Fonts CDN dependency)

## Core Features

### AI & Editing

- 🤖 **AI Conversational Assistant (Optional)**: 26 tools covering every operation — add/edit/delete all section items, rename sections, reorder items/sub-items/sections, toggle visibility, set icons, update basics, manage links, and more. Degrades to manual mode when no API keys are configured.
- 📝 **Rich Manual Editor**: Bold, italic, underline, bullet & numbered lists — each field with its own formatting toolbar. Section and item-level reordering with move buttons. Undo/Redo with Ctrl+Z/Y.
- 🎛️ **Full Section Controls**: Show/hide via eye toggle, rename inline, change icons from 35-icon picker, reorder freely including custom sections.
- 📋 **All Standard Sections**: Personal Info (with links), Overview, Experience, Education, Skills, Projects, Certificates, Publications (with rich description), Languages, Honors & Awards, Hobbies & Interests, Volunteering.
- ➕ **Custom Sections**: Create unlimited custom sections with structured subsections (Name, Affiliation, Time, Description) — each with rich text editing and collapsible items.

### Visual & Export

- 🌓 **Dark Mode**: Full light/dark theme with ripple transition.
- 🎨 **16 Fonts + 12 Theme Colors**: All served locally from `public/fonts/`, zero CDN dependency.
- 👤 **Photo Support**: Upload/crop with accent-colored border frame — available in manual editor.
- 📄 **A4 PDF Export**: Preview and download are 1:1 identical, 3x rendering scale for sharp text. Date/time fields displayed prominently with larger, darker text.

### Project & Data Management

- 📂 **Dashboard**: Multi-resume project cards with drag-and-drop reordering, inline rename (pencil/check toggles), delete, font/color preview, and dark/light mode toggle with ripple animation. Edit/delete buttons always visible.
- 💾 **Auto-save**: 800ms debounced persistence including full conversation history — project display name independent from resume basics.name.
- 📥 **Local Folder Import/Export**: Export all projects as JSON to any folder, import from folder — fully offline backup via File System Access API.
- 🔑 **Visual API Configuration**: Dashboard sidebar panel with radio-button provider selection, eye-toggle key visibility, clear-button to remove keys, and model name fields with sensible defaults. All keys stored in browser `localStorage`.

## Security Architecture

### Zero Key Storage on Server

Talk Forge uses a **browser-direct execution** architecture — your API key never touches server-side persistent storage:

1. **API keys live in the browser** — stored in `localStorage`, controlled entirely by the user
2. **AI logic runs in the browser** — `streamText()` and all 26 resume tools execute client-side in browser memory
3. **Server is a pure CORS proxy** — the `/api/proxy` endpoint forwards HTTP requests to AI APIs byte-for-byte, without parsing, storing, or logging any request/response data
4. **Keys pass through server memory only transiently** — the proxy holds the key in memory for the duration of a single request, then discards it completely

```
Browser (localStorage) ──key──▶ /api/proxy ──key──▶ AI API
                                    │
                          (no persistence, no logging)
```

### Built-in Protections

| Protection | Implementation |
|------------|---------------|
| **SSRF prevention** | Proxy validates target URLs via `isValidApiBaseUrl()` — blocks localhost, private IPs (RFC 1918), link-local addresses |
| **Rate limiting** | Proxy enforces 30 requests/min per IP (in-memory token bucket) |
| **XSS prevention** | All AI-generated URLs sanitized via `safeUrl()`; all HTML content sanitized via `sanitizeHtml()` (whitelist-based) |
| **Server-side validation** | Resume data validated with Zod schema on the server side |
| **HTTPS only** | Proxy rejects non-HTTPS target URLs |
| **Debug logs removed** | All `console.log` debug statements stripped from production code |

### Data Privacy

- **Resume data** stays in the browser's `localStorage` — never transmitted to any server
- **Conversation history** stays in the browser — never transmitted to any server
- **AI API responses** flow through the proxy but are not stored or logged
- **No analytics, no tracking, no telemetry**

## Local Development

```bash
git clone https://github.com/surun7/talk-forge.git
cd talk-forge
npm install
npm run dev   # manual mode works out of the box
```

To enable AI chat, open the Dashboard → sidebar → API Settings and add at least one provider key.

## Deployment

```bash
npm run build
npm start
```

**If you modify the source code** (components, API routes, styles, etc.), you must re-run `npm run build` and restart the Next.js server for changes to take effect. Hot-reload (`npm run dev`) is for local development only and should not be used in production.

## Model Integration

Talk Forge does not bundle any AI model. Configure providers via the **API Settings panel** in the dashboard sidebar or via environment variables.

### Via Dashboard (recommended)

Dashboard → sidebar → **API Settings**:

| Provider | Default Model |
|----------|--------------|
| OpenAI | `gpt-5.4-pro-thinking` |
| Anthropic Claude | `claude-sonnet-4.6` |
| Google Gemini | `gemini-3.1-pro` |
| Kimi (Moonshot) | `kimi-k2.6` |
| MiniMax | `minimax-m3` |
| Zhipu GLM | `glm-5.2` |
| DeepSeek | `deepseek-v4-pro` |
| Xiaomi Mimo | `mimo-v2.5-pro` |

Plus unlimited custom providers (any OpenAI-compatible endpoint). Keys are stored exclusively in your browser's `localStorage`.

### How AI Calls Work

1. User enters API key in the settings panel → stored in `localStorage`
2. When chatting, the browser reads the key from `localStorage` and runs `streamText()` with all resume tools **entirely in the browser**
3. AI API requests are routed through `/api/proxy` (a pure CORS forwarder on your server) — the proxy does **not** store keys, parse responses, or execute any business logic
4. The proxy forwards the request to the AI API and streams the response back to the browser verbatim

### Via Environment Variables (optional server-side fallback)

```env
# CUSTOM_PROVIDERS_JSON=[{"id":"my_provider","name":"My AI","apiKey":"sk-...","baseURL":"https://api.example.com/v1","model":"model-name"}]
```

Without any keys configured, the app runs as a pure manual resume editor.

## Project Structure

```
app/
├── page.tsx                    # Dashboard (project cards + sidebar + theme toggle)
├── editor/
│   └── page.tsx                # Resume editor with undo/redo + auto-save
├── api/
│   ├── proxy/route.ts          # Pure CORS proxy (forwards AI API requests, no storage)
│   ├── chat/route.ts           # [Deprecated] Legacy server-side chat endpoint
│   └── chat/providers/route.ts # Available providers list
├── styles/fonts.css            # Local @font-face definitions (16 fonts)
└── globals.css                 # Tailwind v4 + theme tokens

components/
├── toolbar.tsx                 # Top toolbar (undo/redo, font, color, theme, download)
├── chat-panel.tsx              # AI chat panel (multi-conversation, browser-direct streaming)
├── resume-preview.tsx          # A4 preview frame with automatic pagination
├── dashboard-sidebar.tsx       # Dashboard sidebar (import/export, API settings)
├── api-settings-panel.tsx      # Visual API key & model configuration
├── photo-upload-modal.tsx      # Photo crop/upload modal
└── editor/
    ├── manual-editor.tsx       # Manual editing panel with section ordering
    ├── shared.tsx              # Shared components (SectionHeader, CollapsibleItem, FormattedField, IconPickerButton)
    ├── section-render-map.tsx  # Section component registry
    └── sections/               # Section components (basics ~ volunteers + custom)

hooks/
├── use-project.ts              # Project loading + 800ms debounced auto-save
└── use-resume-pdf.ts           # PDF generation (html2canvas-pro 3x scale)

lib/
├── chat-constants.ts           # Shared chat constants (SYSTEM_PROMPT, provider URLs, event types)
├── client-chat.ts              # Browser-direct streamText + tool execution (core AI logic)
├── storage.ts                  # localStorage adapter (cloud interface reserved)
├── auth.ts                     # Auth placeholder
├── resume-schema.ts            # Zod v4 schemas + template data
├── resume-tools.ts             # Vercel AI SDK tool definitions (browser-safe pure functions)
├── providers.ts                # AI provider setup (createCustomModel, createPatchedFetch)
├── custom-providers-store.ts   # Runtime provider management (server + localStorage)
├── sanitize.ts                 # HTML sanitizer + URL validator + SSRF prevention
└── use-resume-pdf.ts           # PDF generation hook

public/fonts/                   # 16 font families as local TTF files
```

## Code Quality

- **TypeScript strict mode** with `noUncheckedIndexedAccess` enabled for maximum type safety
- **ESLint** with `--max-warnings 0` — warnings fail CI
- **Prettier** + `.editorconfig` for consistent formatting
- **Zod schemas** for runtime data validation on both client and server
- **No `any` types** in storage or tool definitions — fully typed

## License

MIT
