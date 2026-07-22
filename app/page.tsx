"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, Pencil, Check, FileText, Sun, Moon, Languages, Menu, X, GripHorizontal } from "lucide-react";
import { getStorageAdapter, type ProjectMeta } from "@/lib/storage";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { useLocale } from "@/lib/locale-provider";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("talk-forge-theme", next ? "dark" : "light"); } catch {}
  };
  return { dark, toggle };
}

export default function Dashboard() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { dark, toggle: toggleTheme } = useTheme();
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; expanding: boolean; goingDark: boolean } | null>(null);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardSizeRef = useRef({ w: 0, h: 0 });
  const colsRef = useRef(3);

  function getCols(): number {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function cardTransform(index: number, dragIdx: number | null, overIdx: number | null): string {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) return "";
    if (index === dragIdx) return "";
    const { w, h } = cardSizeRef.current;
    if (!w || !h) return "";
    const cols = colsRef.current;
    const gap = 16;
    const cellW = w + gap;
    const cellH = h + gap;
    const curRow = Math.floor(index / cols);
    const curCol = index % cols;
    let newIdx = index;
    if (dragIdx < overIdx && index > dragIdx && index <= overIdx) {
      newIdx = index - 1;
    } else if (dragIdx > overIdx && index >= overIdx && index < dragIdx) {
      newIdx = index + 1;
    }
    const tgtRow = Math.floor(newIdx / cols);
    const tgtCol = newIdx % cols;
    const dx = (tgtCol - curCol) * cellW;
    const dy = (tgtRow - curRow) * cellH;
    return `translate(${dx}px, ${dy}px)`;
  }

  const storage = getStorageAdapter();

  useEffect(() => {
    (async () => {
      const index = await storage.loadProjectsIndex();
      setProjects(index);
      setLoading(false);
    })();
  }, []);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const { id } = await storage.createProject(locale);
      router.push("/editor?id=" + id);
    } finally {
      setCreating(false);
    }
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

  function handleThemeToggle() {
    if (ripple) return;
    const btn = themeBtnRef.current;
    if (!btn) { toggleTheme(); return; }
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const goingDark = !dark;
    toggleTheme();
    setRipple({ x, y, expanding: false, goingDark });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRipple(prev => prev ? { ...prev, expanding: true } : null));
    });
    setTimeout(() => setRipple(null), 550);
  }

  if (loading) {
    return <div className="h-full flex items-center justify-center"><p className="text-slate-400">{t("dashboard.loading")}</p></div>;
  }

  function handleImportComplete() { loadProjects(); }
  function loadProjects() {
    storage.loadProjectsIndex().then(setProjects);
  }

  return (
    <div className="h-full flex flex-col overflow-x-hidden" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Header */}
      <header className="flex items-center h-14 px-4 md:px-6 flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <Menu className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{t("dashboard.title")}</span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-600 mx-1">|</span>
          <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subtitle")}</span>
          <button onClick={handleCreate} disabled={creating}
            className="ml-2 md:ml-4 flex items-center gap-2 h-9 px-3 md:px-4 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> <span className="hidden md:inline">{t("dashboard.newResume")}</span>
          </button>
        </div>
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Language toggle */}
          <button onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
            title={locale === "zh" ? t("dashboard.english") : t("dashboard.chinese")}>
            <Languages className="w-4 h-4" />
          </button>
          {/* Theme toggle */}
          <button ref={themeBtnRef} onClick={handleThemeToggle}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
            title={dark ? t("dashboard.lightMode") : t("dashboard.darkMode")}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex min-h-0">
        <DashboardSidebar onImportComplete={handleImportComplete} className="hidden md:flex" />
        {/* Mobile drawer — slides in from left like PC sidebar */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 z-50 h-full w-60 md:hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <DashboardSidebar onImportComplete={handleImportComplete} />
            </div>
          </>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("dashboard.emptyTitle")}</p>
              <p className="text-sm text-slate-400 mb-6">{t("dashboard.emptyDesc")}</p>
              <button onClick={handleCreate}
                className="inline-flex items-center gap-2 h-10 px-6 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200">
                <Plus className="w-4 h-4" /> {t("dashboard.createResume")}
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
            onDragOver={e => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              colsRef.current = getCols();
              const grid = gridRef.current;
              if (!grid) return;
              const rect = grid.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const { w, h } = cardSizeRef.current;
              if (!w || !h) return;
              const cols = colsRef.current;
              const gap = 16;
              const col = Math.floor(x / (w + gap));
              const row = Math.floor(y / (h + gap));
              const idx = Math.min(row * cols + col, projects.length - 1);
              if (idx !== overIndex) setOverIndex(idx);
            }}
            onDragLeave={e => {
              if (!gridRef.current?.contains(e.relatedTarget as Node)) {
                setOverIndex(null);
              }
            }}
            onDrop={e => {
              e.preventDefault();
              if (dragIndex === null || overIndex === null || dragIndex === overIndex) return;
              const updated = [...projects];
              const [moved] = updated.splice(dragIndex, 1);
              if (!moved) return;
              updated.splice(overIndex, 0, moved);
              setProjects(updated);
              storage.saveProjectsIndex(updated);
              setDragIndex(null);
              setOverIndex(null);
              isDraggingRef.current = false;
            }}>
            {projects.map((meta, index) => {
              const tr = cardTransform(index, dragIndex, overIndex);
              return (
              <div key={meta.id}
                draggable={renameId !== meta.id}
                onDragStart={e => {
                  isDraggingRef.current = true;
                  e.dataTransfer.effectAllowed = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  cardSizeRef.current = { w: rect.width, h: rect.height };
                  colsRef.current = getCols();
                  setDragIndex(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                  isDraggingRef.current = false;
                }}
                onClick={() => {
                  if (isDraggingRef.current) {
                    isDraggingRef.current = false;
                    return;
                  }
                  router.push("/editor?id=" + meta.id);
                }}
                className={`group relative bg-white dark:bg-slate-800 rounded-xl p-5 border transition-all duration-200 cursor-pointer select-none ${
                  dragIndex === index
                    ? "opacity-40 border-indigo-300 dark:border-indigo-600 shadow-md z-10"
                    : dragIndex !== null
                    ? "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                }`}
                style={dragIndex !== null ? { transform: tr || undefined, transition: "transform 0.25s ease" } : { transition: "transform 0.25s ease" }}>
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
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">{meta.name || t("dashboard.untitled")}</h3>
                  )}
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); if (renameId === meta.id) { commitRename(meta.id); } else { startRename(meta); } }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      {renameId === meta.id ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
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
                <div className="absolute bottom-2 right-2 text-slate-300 dark:text-slate-600 opacity-60">
                  <GripHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>
            );})}
          </div>
        )}
        </div>
      </div>

      {/* Ripple overlay */}
      {ripple && (
        <div className="fixed z-[9998] pointer-events-none" style={{
          left: ripple.x, top: ripple.y, width: ripple.expanding ? "200vmax" : "1px", height: ripple.expanding ? "200vmax" : "1px",
          marginLeft: ripple.expanding ? "-100vmax" : "-0.5px", marginTop: ripple.expanding ? "-100vmax" : "-0.5px",
          borderRadius: "50%", background: "transparent",
          boxShadow: `0 0 0 100vmax ${ripple.goingDark ? "#f1f5f9" : "#020617"}`,
          transition: ripple.expanding ? "width 0.45s ease-out, height 0.45s ease-out, margin-left 0.45s ease-out, margin-top 0.45s ease-out" : "none",
        }} />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{t("dashboard.deleteTitle")}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{t("dashboard.deleteDesc")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="h-8 px-4 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors font-medium">{t("dashboard.cancel")}</button>
              <button onClick={() => handleDelete(deleteId)} className="h-8 px-4 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">{t("dashboard.delete")}</button>
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
