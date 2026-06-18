# Talk Forge

A **pluggable AI-powered resume builder framework** with real-time A4 preview and pixel-perfect PDF export. Connect any OpenAI-compatible model (Kimi, GPT, Claude, DeepSeek, Ollama, etc.) or use it entirely offline as a standalone resume editor.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 + TypeScript 5 + Tailwind CSS 4
- **AI Layer**: Vercel AI SDK v6 (supports any OpenAI-compatible API endpoint)
- **PDF Generation**: html2canvas-pro + jsPDF (pixel-level A4 pagination at 3x scale)
- **State Management**: React Hooks + localStorage (multi-project isolation with auto-save)
- **Fonts**: 16 fonts served locally as TTF files (no Google Fonts CDN dependency)

## Core Features

### AI & Editing

- 🤖 **AI Conversational Assistant (Optional)**: Describe changes in natural language and the AI invokes tools to modify your resume. Fully degrades to manual mode when no API keys are configured.
- 📝 **Rich Manual Editor**: Full rich text support (bold, italic, underline, bullet & numbered lists), real-time section reordering with move buttons at both section and item level, Undo/Redo with Ctrl+Z/Y
- 🎛️ **Section Controls**: Show/hide any section via eye toggle, rename sections with inline pencil button, change section icons from a 35-icon picker, reorder sections freely including custom sections
- 📋 **All Standard Resume Sections**: Personal Info (with links), Overview, Experience, Education, Skills, Projects, Certificates, Publications, Languages, Honors & Awards, Hobbies & Interests, Volunteering, plus unlimited custom sections

### Visual & Export

- 🌓 **Dark Mode**: Full light/dark theme support with animated ripple transition
- 🎨 **16 Fonts + 12 Theme Colors**: Lora, Inter, Montserrat, Merriweather, and 12 more — all served locally from `public/fonts/` with zero external CDN requests
- 👤 **Photo Support**: Upload/crop photo with accent-colored border frame
- 📄 **A4 PDF Export**: Preview frame and downloaded file are 1:1 identical, 3x rendering scale for sharp output

### Project Management

- 📂 **Dashboard**: Multi-resume project cards with rename, delete, font/color preview
- 💾 **Auto-save**: Every change persisted to localStorage with 800ms debounce, including full conversation history
- 📥 **Local Folder Import/Export**: Export all projects as JSON files to any local folder, import them back — fully offline backup using File System Access API
- 🔧 **Visual API Configuration**: Configure API keys for OpenAI, Anthropic, Google Gemini, Groq, and custom providers directly in the dashboard sidebar — no `.env` editing required. All keys stored locally in your browser, never sent to any server

## Local Development

```bash
# 1. Clone
git clone https://github.com/surun7/talk-forge.git
cd talk-forge

# 2. Install dependencies
npm install

# 3. Start dev server (works without API keys — manual mode fully functional)
npm run dev
```

## Model Integration

Talk Forge does not bundle any AI model. It connects to external APIs through Vercel AI SDK. You can configure multiple providers via the **API Settings panel** in the dashboard sidebar, or through environment variables.

### Via Dashboard (recommended for users)

Open the dashboard → sidebar → **API Settings**. Enter keys for:

- OpenAI
- Anthropic Claude
- Google Gemini
- Groq
- Custom providers (Kimi, DeepSeek, Ollama, etc.)

Keys are stored exclusively in your browser's `localStorage` and **never transmitted** to any backend server.

### Via Environment Variables (recommended for self-hosting)

```env
# Built-in providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
GROQ_API_KEY=...

# Custom providers (server-side JSON array)
# CUSTOM_PROVIDERS_JSON=[{"id":"kimi","name":"Kimi","apiKey":"sk-...","baseURL":"https://api.moonshot.cn/v1","model":"moonshot-v1-8k"}]
```

When no API keys are configured, the app hides the chat panel and runs as a pure manual resume editor.

## Project Structure

```
app/
├── page.tsx                    # Dashboard (project overview + sidebar)
├── editor/
│   └── page.tsx                # Resume editor with undo/redo + auto-save
├── api/chat/route.ts           # AI chat SSE endpoint
├── styles/fonts.css            # Local @font-face definitions (16 fonts)
└── globals.css                 # Tailwind v4 + theme tokens

components/
├── toolbar.tsx                 # Top toolbar (undo/redo, font, color, theme, download)
├── chat-panel.tsx              # AI chat panel (multi-conversation, SSE streaming)
├── resume-preview.tsx          # A4 preview frame with automatic pagination
├── dashboard-sidebar.tsx       # Dashboard sidebar (import/export, API settings)
├── api-settings-panel.tsx      # Visual API key configuration panel
├── photo-upload-modal.tsx      # Photo crop/upload modal
└── editor/
    ├── manual-editor.tsx       # Manual editing panel with section ordering
    ├── shared.tsx              # Shared components (SectionHeader, CollapsibleItem, FormattedField, IconPickerButton)
    ├── section-render-map.tsx  # Section component registry
    └── sections/               # 12 section components (basics ~ volunteers)

hooks/
├── use-project.ts              # Project loading + 800ms debounced auto-save
└── use-resume-pdf.ts           # PDF generation (html2canvas-pro 3x scale)

lib/
├── storage.ts                  # localStorage adapter with cloud interface reserved
├── auth.ts                     # Auth placeholder (cloud login stubs)
├── resume-schema.ts            # Zod v4 schemas + types + template data
├── resume-tools.ts             # Vercel AI SDK tool definitions
├── providers.ts                # AI provider setup
├── custom-providers-store.ts   # Runtime custom provider management (server + localStorage)
└── use-resume-pdf.ts           # PDF generation hook

public/fonts/                   # 16 font families as local TTF files
```

## License

MIT
