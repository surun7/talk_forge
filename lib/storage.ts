import { createTemplateResume, createChineseTemplateResume, resumeSchema, type Resume } from "./resume-schema";
import { z as Zod } from "zod";

// ── Types ──

export interface Message {
  role: "user" | "assistant";
  content: string;
  time: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ProjectMeta {
  id: string;
  name: string;
  previewFont: string;
  previewColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectData {
  resume: Resume;
  conversations: Conversation[];
  sectionOrder: string[];
}

export interface StorageAdapter {
  loadProjectsIndex(): Promise<ProjectMeta[]>;
  saveProjectsIndex(index: ProjectMeta[]): Promise<void>;
  loadProject(id: string): Promise<ProjectData | null>;
  saveProject(id: string, data: ProjectData): Promise<void>;
  deleteProject(id: string): Promise<void>;
  createProject(locale?: "en" | "zh"): Promise<{ id: string; data: ProjectData }>;
  exportAllLocalProjects(): Promise<Record<string, ProjectData>>;
}

// ── LocalStorage Implementation ──

const INDEX_KEY = "talk_forge_projects_index";
const PROJECT_PREFIX = "talk_forge_project_";

function makeTemplateData(locale?: "en" | "zh"): ProjectData {
  return {
    resume: locale === "zh" ? createChineseTemplateResume() : createTemplateResume(),
    conversations: [],
    sectionOrder: ["overview", "experience", "education", "skills", "projects", "certificates", "publications", "languages", "honors", "hobbies", "volunteers"],
  };
}

function readLS<T>(key: string, fallback: T, schema?: Zod.ZodType<T>): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (schema) {
      const result = schema.safeParse(parsed);
      return result.success ? result.data : fallback;
    }
    return parsed as T;
  } catch (e) {
    console.error(`[storage] Failed to read localStorage key "${key}":`, e);
  }
  return fallback;
}

function writeLS(key: string, value: unknown) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error(`[storage] Failed to write localStorage key "${key}":`, e); }
}

function deleteLS(key: string) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.removeItem(key); }
  catch (e) { console.error(`[storage] Failed to delete localStorage key "${key}":`, e); }
}

class LocalStorageAdapter implements StorageAdapter {
  async loadProjectsIndex(): Promise<ProjectMeta[]> {
    return readLS<ProjectMeta[]>(INDEX_KEY, []);
  }

  async saveProjectsIndex(index: ProjectMeta[]): Promise<void> {
    writeLS(INDEX_KEY, index);
  }

  async loadProject(id: string): Promise<ProjectData | null> {
    const data = readLS<ProjectData | null>(PROJECT_PREFIX + id, null);
    if (data) {
      const parsed = resumeSchema.safeParse(data.resume);
      if (!parsed.success) return null;
      data.resume = parsed.data;
    }
    return data;
  }

  async saveProject(id: string, data: ProjectData): Promise<void> {
    writeLS(PROJECT_PREFIX + id, data);
    // Update index meta
    const index = await this.loadProjectsIndex();
    const meta = index.find(m => m.id === id);
    if (meta) {
      meta.name = data.resume.basics.name || "Untitled";
      meta.previewFont = data.resume.basics.font || "lora";
      meta.previewColor = data.resume.basics.accentColor || "indigo";
      meta.updatedAt = Date.now();
      await this.saveProjectsIndex(index);
    }
  }

  async deleteProject(id: string): Promise<void> {
    deleteLS(PROJECT_PREFIX + id);
    const index = await this.loadProjectsIndex();
    await this.saveProjectsIndex(index.filter(m => m.id !== id));
  }

  async createProject(locale?: "en" | "zh"): Promise<{ id: string; data: ProjectData }> {
    const id = crypto.randomUUID();
    const data = makeTemplateData(locale);
    writeLS(PROJECT_PREFIX + id, data);
    const index = await this.loadProjectsIndex();
    index.unshift({
      id,
      name: data.resume.basics.name || "Untitled",
      previewFont: data.resume.basics.font || "lora",
      previewColor: data.resume.basics.accentColor || "indigo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await this.saveProjectsIndex(index);
    return { id, data };
  }

  async exportAllLocalProjects(): Promise<Record<string, ProjectData>> {
    const index = await this.loadProjectsIndex();
    const result: Record<string, ProjectData> = {};
    for (const meta of index) {
      const data = await this.loadProject(meta.id);
      if (data) result[meta.id] = data;
    }
    return result;
  }
}

// ── Factory ──

let _adapter: StorageAdapter | null = null;
let _migrated = false;

function migrateLegacyData(adapter: StorageAdapter) {
  try {
    const oldResume = readLS<Record<string, unknown> | null>("talk_forge_resume", null);
    const oldConversations = readLS<Conversation[] | null>("talk_forge_conversations", null);
    if (!oldResume && !oldConversations) return;
    // Create a new project from old data
    const resume = oldResume && resumeSchema.safeParse(oldResume).success
      ? (oldResume as Resume)
      : createTemplateResume();
    const data: ProjectData = {
      resume,
      conversations: oldConversations || [],
      sectionOrder: ["overview", "experience", "education", "skills", "projects", "certificates", "publications", "languages", "honors", "hobbies", "volunteers"],
    };
    const id = crypto.randomUUID();
    writeLS(PROJECT_PREFIX + id, data);
    const index = readLS<ProjectMeta[]>(INDEX_KEY, []);
    index.unshift({
      id,
      name: resume.basics.name || "Migrated Resume",
      previewFont: resume.basics.font || "lora",
      previewColor: resume.basics.accentColor || "indigo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    writeLS(INDEX_KEY, index);
    deleteLS("talk_forge_resume");
    deleteLS("talk_forge_conversations");
  } catch (e) {
    console.error("[storage] Legacy data migration failed:", e);
  }
}

export function getStorageAdapter(): StorageAdapter {
  if (!_adapter) {
    _adapter = new LocalStorageAdapter();
    if (!_migrated) {
      _migrated = true;
      migrateLegacyData(_adapter);
    }
  }
  // Future: return CloudStorageAdapter if isAuthenticated()
  return _adapter;
}
