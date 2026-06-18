"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, Pencil, Check, FileText } from "lucide-react";
import { getStorageAdapter, type ProjectMeta } from "@/lib/storage";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const storage = getStorageAdapter();

  useEffect(() => {
    (async () => {
      const index = await storage.loadProjectsIndex();
      setProjects(index);
      setLoading(false);
    })();
  }, []);

  async function handleCreate() {
    const { id } = await storage.createProject();
    router.push("/editor?id=" + id);
  }

  async function handleDelete(id: string) {
    await storage.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  }

  function startRename(meta: ProjectMeta) {
    setRenameId(meta.id);
    setRenameValue(meta.name);
  }

  async function commitRename(id: string) {
    const index = await storage.loadProjectsIndex();
    const meta = index.find(m => m.id === id);
    if (meta && renameValue.trim()) {
      meta.name = renameValue.trim();
      await storage.saveProjectsIndex(index);
      setProjects([...index]);
    }
    setRenameId(null);
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  if (loading) {
    return <div className="h-full flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>;
  }

  function handleImportComplete() { loadProjects(); }
  function loadProjects() {
    storage.loadProjectsIndex().then(setProjects);
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Header */}
      <header className="flex items-center h-14 px-6 flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Talk Forge</span>
          <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Dashboard</span>
          <button onClick={handleCreate}
            className="ml-4 flex items-center gap-2 h-9 px-4 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200">
            <Plus className="w-3.5 h-3.5" /> New Resume
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex min-h-0">
        <DashboardSidebar onImportComplete={handleImportComplete} />
        <div className="flex-1 overflow-y-auto p-6">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">No resumes yet</p>
              <p className="text-sm text-slate-400 mb-6">Create your first resume to get started</p>
              <button onClick={handleCreate}
                className="inline-flex items-center gap-2 h-10 px-6 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200">
                <Plus className="w-4 h-4" /> Create Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {projects.map(meta => (
              <div key={meta.id}
                className="group relative bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => router.push("/editor?id=" + meta.id)}>
                <div className="flex items-start justify-between mb-3">
                  {renameId === meta.id ? (
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") commitRename(meta.id); if (e.key === "Escape") setRenameId(null); }}
                      onBlur={() => commitRename(meta.id)}
                      onClick={e => e.stopPropagation()}
                      className="text-sm font-semibold bg-white dark:bg-slate-700 border border-indigo-300 rounded px-2 py-1 outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">{meta.name || "Untitled"}</h3>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); startRename(meta); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteId(meta.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">{formatDate(meta.updatedAt)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{meta.previewFont}</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorHex(meta.previewColor) }} />
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Delete Resume</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="h-8 px-4 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="h-8 px-4 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    indigo: "#4f46e5", blue: "#2563eb", sky: "#0284c7", teal: "#0d9488",
    emerald: "#059669", green: "#16a34a", amber: "#d97706", orange: "#ea580c",
    rose: "#e11d48", pink: "#db2777", violet: "#7c3aed", slate: "#475569",
  };
  return map[color] || "#4f46e5";
}
