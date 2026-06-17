import { createTemplateResume, resumeSchema, type Resume } from "./resume-schema";

// ── Types ──

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
  conversations: any[];  // Conversation[]
  sectionOrder: string[];
}

export interface StorageAdapter {
  loadProjectsIndex(): Promise<ProjectMeta[]>;
  saveProjectsIndex(index: ProjectMeta[]): Promise<void>;
  loadProject(id: string): Promise<ProjectData | null>;
  saveProject(id: string, data: ProjectData): Promise<void>;
  deleteProject(id: string): Promise<void>;
  createProject(): Promise<{ id: string; data: ProjectData }>;
  exportAllLocalProjects(): Promise<Record<string, ProjectData>>;
}

// ── LocalStorage Implementation ──

const INDEX_KEY = "talk_forge_projects_index";
const PROJECT_PREFIX = "talk_forge_project_";

function makeTemplateData(): ProjectData {
  return {
    resume: createTemplateResume(),
    conversations: [],
    sectionOrder: ["overview", "experience", "education", "skills", "projects", "certificates", "publications", "languages", "honors", "hobbies", "volunteers"],
  };
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function writeLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function deleteLS(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

class LocalStorageAdapter implements StorageAdapter {
  async loadProjectsIndex(): Promise<ProjectMeta[]> {
    return readLS<ProjectMeta[]>(INDEX_KEY, []);
  }

  async saveProjectsIndex(index: ProjectMeta[]): Promise<void> {
    writeLS(INDEX_KEY, index);
  }

  async loadProject(id: string): Promise<ProjectData | null> {
    const raw = localStorage.getItem(PROJECT_PREFIX + id);
    console.log("[LOAD] raw exists:", !!raw, "projectId:", id);
    const data = readLS<ProjectData | null>(PROJECT_PREFIX + id, null);
    if (data) {
      console.log("[LOAD] parsed conversations count:", data.conversations?.length, "firstConvMessages:", data.conversations?.[0]?.messages?.length);
      const parsed = resumeSchema.safeParse(data.resume);
      if (!parsed.success) return null;
      data.resume = parsed.data;
    }
    return data;
  }

  async saveProject(id: string, data: ProjectData): Promise<void> {
    console.log("[SAVE] projectId:", id, "conversations count:", data.conversations?.length, "firstConvMessages:", data.conversations?.[0]?.messages?.length);
    writeLS(PROJECT_PREFIX + id, data);
    // Verify save
    try {
      const verify = localStorage.getItem(PROJECT_PREFIX + id);
      const parsed = JSON.parse(verify || "{}");
      console.log("[SAVE VERIFY] conversations:", parsed.conversations?.length);
    } catch (e) { console.error("[SAVE FAILED]", e); }
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

  async createProject(): Promise<{ id: string; data: ProjectData }> {
    const id = crypto.randomUUID();
    const data = makeTemplateData();
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
    const oldResume = readLS<any | null>("talk_forge_resume", null);
    const oldConversations = readLS<any[] | null>("talk_forge_conversations", null);
    if (!oldResume && !oldConversations) return;
    // Create a new project from old data
    const resume = oldResume && resumeSchema.safeParse(oldResume).success ? oldResume : createTemplateResume();
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
  } catch {}
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
