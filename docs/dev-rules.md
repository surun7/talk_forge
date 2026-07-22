# Development Rules

## Critical: Schema Backward Compatibility

**This is the #1 rule. Violating it destroys user data.**

### The Problem

`lib/storage.ts` loads project data with `zod.safeParse()`. If parsing fails, it returns `null`:

```typescript
const parsed = resumeSchema.safeParse(data.resume);
if (!parsed.success) return null; // ← user's entire resume is GONE
```

When `null` is returned, the editor falls back to the empty template. If the user then makes ANY edit, auto-save overwrites their original data in localStorage forever.

### The Rules

1. **Every new schema field MUST have `.default()` or `.optional()`**

   ```typescript
   // ❌ WRONG — old data without this field fails safeParse
   wechat: z.string(),

   // ✅ CORRECT — old data gets "" automatically
   wechat: z.string().default(""),
   ```

2. **When renaming fields, use `.passthrough()` + fallback access**

   ```typescript
   // Schema keeps the old field via .passthrough()
   export const customItemSchema = z.object({
     startDate: z.string().default(""),
     // ...
   }).passthrough(); // ← keeps old `time` field alive

   // Code falls back to old field name
   value={item.startDate || (item as any).time || ""}
   ```

3. **Always test schema changes with old data**

   Before committing a schema change, mentally trace: "If a user has data created 2 weeks ago, will `safeParse` still succeed?" Every single field in the schema must have a path that parses successfully from existing stored data.

4. **Do NOT change a field's type or make it required retroactively**

   ```typescript
   // ❌ WRONG — old data has `date` as string, now it's required
   date: z.string(),  →  date: z.date(),

   // ✅ CORRECT — add new field alongside old, with .passthrough()
   date: z.string().optional(),  // keep
   startDate: z.string().default(""),  // new
   endDate: z.string().default(""),  // new
   ```

### Auto-Save Danger

The auto-save hook (`hooks/use-project.ts`) watches `resume` state and saves on change. If `safeParse` returns `null`, the fallback template becomes the new resume state. Any user interaction triggers auto-save, permanently overwriting the original data.

## Project Conventions

- TypeScript strict mode with `noUncheckedIndexedAccess`
- All storage operations are async-ready (current backend: localStorage)
- Section order must always be deduplicated: `[...new Set(arr)]`
- Use `useRef` for latest values in closure-based callbacks
- 800ms debounce on auto-save

## Commit Style

- `feat:` for new features
- `fix:` for bug fixes
- Use present tense, imperative mood
