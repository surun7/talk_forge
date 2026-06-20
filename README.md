# Talk Forge

A **pluggable AI-powered resume builder framework** with real-time A4 preview and pixel-perfect PDF export. Connect any OpenAI-compatible model or use it entirely offline as a standalone resume editor.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 + TypeScript 5 + Tailwind CSS 4
- **AI Layer**: Vercel AI SDK v6 (supports any OpenAI-compatible API endpoint)
- **PDF Generation**: html2canvas-pro + jsPDF (pixel-level A4 pagination at 3x scale)
- **State Management**: React Hooks + localStorage (multi-project isolation with auto-save)
- **Fonts**: 16 fonts served locally as TTF files (no Google Fonts CDN dependency)

## Core Features

### AI & Editing

- 🤖 **AI Conversational Assistant (Optional)**: 26 tools covering every operation — add/edit/delete all section items, rename sections, reorder items/sub-items/sections, toggle visibility, set icons, update basics, manage links, and more. Degrades to manual mode when no API keys are configured.
- 📝 **Rich Manual Editor**: Bold, italic, underline, bullet & numbered lists. Section and item-level reordering with move buttons. Undo/Redo with Ctrl+Z/Y.
- 🎛️ **Full Section Controls**: Show/hide via eye toggle, rename inline, change icons from 35-icon picker, reorder freely including custom sections.
- 📋 **All Standard Sections**: Personal Info (with links), Overview, Experience, Education, Skills, Projects, Certificates, Publications, Languages, Honors & Awards, Hobbies & Interests, Volunteering.
- ➕ **Custom Sections**: Create unlimited custom sections with structured subsections (Name, Affiliation, Time, Description) — each with rich text editing and collapsible items.

### Visual & Export

- 🌓 **Dark Mode**: Full light/dark theme with ripple transition.
- 🎨 **16 Fonts + 12 Theme Colors**: All served locally from `public/fonts/`, zero CDN dependency.
- 👤 **Photo Support**: Upload/crop with accent-colored border frame.
- 📄 **A4 PDF Export**: Preview and download are 1:1 identical, 3x rendering scale for sharp text.

### Project & Data Management

- 📂 **Dashboard**: Multi-resume project cards with rename, delete, font/color preview, and dark/light mode toggle with ripple animation.
- 💾 **Auto-save**: 800ms debounced persistence including full conversation history.
- 📥 **Local Folder Import/Export**: Export all projects as JSON to any folder, import from folder — fully offline backup via File System Access API.
- 🔑 **Visual API Configuration**: Dashboard sidebar panel with radio-button provider selection, eye-toggle key visibility, clear-button to remove keys, and model name fields with sensible defaults. All keys stored in browser `localStorage` — never transmitted to any server.

## Local Development

```bash
git clone https://github.com/surun7/talk-forge.git
cd talk-forge
npm install
npm run dev   # manual mode works out of the box
```

To enable AI chat, open the Dashboard → sidebar → API Settings and add at least one provider key.

## Model Integration

Talk Forge does not bundle any AI model. Configure providers via the **API Settings panel** in the dashboard sidebar or via environment variables.

### Via Dashboard (recommended)

Dashboard → sidebar → **API Settings**:

| Provider | Default Model |
|----------|--------------|
| OpenAI | `gpt-4.1` |
| Anthropic Claude | `claude-opus-4-20250514` |
| Google Gemini | `gemini-2.5-pro` |
| Kimi (Moonshot) | `kimi-k2.6` |
| MiniMax | `minimax-m3` |
| Zhipu GLM | `glm-5.2` |
| DeepSeek | `deepseek-v4-pro` |
| Xiaomi Mimo | `mimo-v2.5-pro` |

Plus unlimited custom providers (any OpenAI-compatible endpoint). Keys are stored exclusively in your browser and **never leave your machine**.

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
├── api/chat/route.ts           # AI chat SSE endpoint
├── styles/fonts.css            # Local @font-face definitions (16 fonts)
└── globals.css                 # Tailwind v4 + theme tokens

components/
├── toolbar.tsx                 # Top toolbar (undo/redo, font, color, theme, download)
├── chat-panel.tsx              # AI chat panel (multi-conversation, SSE streaming)
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
├── storage.ts                  # localStorage adapter (cloud interface reserved)
├── auth.ts                     # Auth placeholder
├── resume-schema.ts            # Zod v4 schemas + template data
├── resume-tools.ts             # Vercel AI SDK tool definitions
├── providers.ts                # AI provider setup
├── custom-providers-store.ts   # Runtime provider management (server + localStorage)
└── use-resume-pdf.ts           # PDF generation hook

public/fonts/                   # 16 font families as local TTF files
```

## License

MIT
