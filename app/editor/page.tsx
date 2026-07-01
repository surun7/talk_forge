"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResumePreview from "@/components/resume-preview";
import ChatPanel from "@/components/chat-panel";
import Toolbar from "@/components/toolbar";
import { createTemplateResume, type Resume } from "@/lib/resume-schema";
import { getStorageAdapter } from "@/lib/storage";
import { useProject } from "@/hooks/use-project";
import PhotoUploadModal from "@/components/photo-upload-modal";
import { useLocale } from "@/lib/locale-provider";
import { FileText, MessageCircle, Eye, Menu, X } from "lucide-react";

type EditMode = "agent" | "manual";

const MAX_HISTORY = 50;

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>}>
      <EditorContent />
    </Suspense>
  );
}

function EditorContent() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [projectId, setProjectId] = useState<string | null>(idParam);
  const [initialized, setInitialized] = useState(false);

  // Auto-create project if no ID
  useEffect(() => {
    if (initialized) return;
    (async () => {
      if (!projectId) {
        const storage = getStorageAdapter();
        const { id } = await storage.createProject();
        setProjectId(id);
        router.replace("/editor?id=" + id);
      } else {
        setInitialized(true);
      }
    })();
  }, [projectId, initialized, router]);

  const {
    projectName,
    resume: loadedResume,
    setResume,
    conversations,
    setConversations,
    sectionOrder,
    setSectionOrder,
    isLoading,
  } = useProject(projectId);

  const resume = loadedResume || createTemplateResume();

  // ── Undo/Redo ──
  const historyRef = useRef<Resume[]>([]);
  const indexRef = useRef(0);
  const isUndoingRef = useRef(false);
  const pushLockRef = useRef(false);
  const resumeRef = useRef(resume);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { resumeRef.current = resume; }, [resume]);
  useEffect(() => {
    if (loadedResume && historyRef.current.length === 0) {
      historyRef.current = [loadedResume];
      indexRef.current = 0;
    }
  }, [loadedResume]);

  const pushHistory = useCallback((state: Resume) => {
    if (pushLockRef.current) { pushLockRef.current = false; return; }
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(state);
    indexRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > MAX_HISTORY) { historyRef.current.shift(); indexRef.current -= 1; }
    pushLockRef.current = true;
    setTimeout(() => { pushLockRef.current = false; }, 0);
    setCanUndo(indexRef.current > 0);
    setCanRedo(false);
  }, []);

  const updateResume = useCallback((updater: Resume | ((prev: Resume) => Resume)) => {
    if (isUndoingRef.current) { isUndoingRef.current = false; setResume(updater as Resume); return; }
    setResume((prev: Resume) => {
      const next = typeof updater === "function" ? (updater as (prev: Resume) => Resume)(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory, setResume]);

  const updateResumeDebounced = useCallback((updater: Resume | ((prev: Resume) => Resume)) => {
    if (isUndoingRef.current) { isUndoingRef.current = false; setResume(updater as Resume); return; }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setResume((prev: Resume) => {
      return typeof updater === "function" ? (updater as (prev: Resume) => Resume)(prev) : updater;
    });
    debounceTimerRef.current = setTimeout(() => {
      if (resumeRef.current) pushHistory(resumeRef.current);
    }, 300);
  }, [pushHistory, setResume]);

  const handleUndo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    isUndoingRef.current = true;
    const state = historyRef.current[indexRef.current];
    if (state) setResume(state);
    setCanUndo(indexRef.current > 0);
    setCanRedo(true);
  }, [setResume]);

  const handleRedo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    isUndoingRef.current = true;
    const state = historyRef.current[indexRef.current];
    if (state) setResume(state);
    setCanUndo(true);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, [setResume]);

  // Expose sectionOrder setter for chat panel SSE
  useEffect(() => {
    (window as any).__talkForgeSetSectionOrder = (order: string[]) => {
      setSectionOrder(order);
    };
    return () => { delete (window as any).__talkForgeSetSectionOrder; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if (mod && ((e.key === "z" && e.shiftKey) || e.key === "y")) { e.preventDefault(); handleRedo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo, handleRedo]);

  // ── Handlers ──
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("agent");

  function moveSectionUp(key: string) { setSectionOrder((prev: string[]) => { const i = prev.indexOf(key); if (i <= 0) return prev; const n = [...prev]; const a = n[i]!; const b = n[i - 1]!; n[i] = b; n[i - 1] = a; return n; }); }
  function moveSectionDown(key: string) { setSectionOrder((prev: string[]) => { const i = prev.indexOf(key); if (i < 0 || i >= prev.length - 1) return prev; const n = [...prev]; const a = n[i]!; const b = n[i + 1]!; n[i] = b; n[i + 1] = a; return n; }); }

  const creatingRef = useRef(false);
  const handleNewResume = useCallback(async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    const storage = getStorageAdapter();
    const { id } = await storage.createProject(locale);
    router.push("/editor?id=" + id);
  }, [router, locale]);

  const handlePhotoSave = useCallback((dataUrl: string) => {
    updateResume((prev: Resume) => ({ ...prev, basics: { ...prev.basics, photo: dataUrl } }));
  }, [updateResume]);

  const handleAddCustomSection = useCallback((id: string) => { setSectionOrder(prev => [...prev, id]); }, []);

  const prevCsIdsRef = useRef(new Set(resume.customSections.map(s => s.id)));
  useEffect(() => { prevCsIdsRef.current = new Set(resume.customSections.map(s => s.id)); }, [resume.customSections]);

  // On load, ensure all custom section IDs are in sectionOrder
  useEffect(() => {
    if (!resume || isLoading) return;
    const missing = resume.customSections.filter(s => !sectionOrder.includes(s.id)).map(s => s.id);
    if (missing.length > 0) {
      setSectionOrder(prev => [...prev, ...missing]);
    }
  }, [isLoading]); // run once after load

  const handleResumeUpdate = useCallback((updated: Resume) => {
    // Sync new custom sections from AI into sectionOrder
    const newIds = updated.customSections.filter(s => !prevCsIdsRef.current.has(s.id)).map(s => s.id);
    if (newIds.length > 0) {
      setSectionOrder(prev => [...prev, ...newIds.filter(id => !prev.includes(id))]);
    }
    prevCsIdsRef.current = new Set(updated.customSections.map(s => s.id));
    updateResumeDebounced(updated);
  }, [updateResumeDebounced]);

  if (isLoading || !initialized) {
    return <div className="h-full flex items-center justify-center"><p className="text-slate-400">{t("editor.loading")}</p></div>;
  }

  const previewPanel = (
    <div className="flex-1 min-h-0 flex justify-center pt-3 pb-0">
      <div className="flex-1 overflow-y-auto flex justify-center">
        <div ref={previewRef}>
          <ResumePreview resume={resume} sectionOrder={sectionOrder} />
        </div>
      </div>
    </div>
  );

  const chatPanel = (
    <ChatPanel
      resume={resume}
      onResumeUpdate={handleResumeUpdate}
      onOpenPhotoModal={() => setShowPhotoModal(true)}
      editMode={editMode}
      sectionOrder={sectionOrder}
      onMoveSectionUp={moveSectionUp}
      onMoveSectionDown={moveSectionDown}
      onAddCustomSection={handleAddCustomSection}
      externalConversations={conversations}
      onConversationsChange={setConversations}
    />
  );

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <Toolbar
        onNewResume={handleNewResume}
        previewRef={previewRef}
        fileName={resume.basics.name || undefined}
        projectName={projectName}
        font={resume.basics.font || "lora"}
        fontSize={resume.basics.fontSize || 12}
        accentColor={resume.basics.accentColor || "indigo"}
        onFontChange={(f: string) => updateResume((prev: Resume) => ({ ...prev, basics: { ...prev.basics, font: f } }))}
        onFontSizeChange={(s: number) => updateResume((prev: Resume) => ({ ...prev, basics: { ...prev.basics, fontSize: s } }))}
        onAccentColorChange={(c: string) => updateResume((prev: Resume) => ({ ...prev, basics: { ...prev.basics, accentColor: c } }))}
        editMode={editMode}
        onEditModeChange={setEditMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className="hidden lg:flex flex-1 min-h-0 border-t border-slate-200 dark:border-slate-800">
        <div className="w-2/3 flex border-r border-slate-200 dark:border-slate-800" style={{ background: "var(--bg)" }}>
          {previewPanel}
        </div>
        <div className="w-1/3 flex flex-col min-h-0" style={{ background: "var(--panel-bg)" }}>
          {chatPanel}
        </div>
      </div>

      {/* Mobile: edit-first layout */}
      <div className="flex lg:hidden flex-1 flex-col min-h-0 border-t border-slate-200 dark:border-slate-800">
        <MobileEditor mode={editMode} onModeChange={setEditMode} previewPanel={previewPanel} chatPanel={chatPanel} />
      </div>

      <PhotoUploadModal open={showPhotoModal} onClose={() => setShowPhotoModal(false)} onSave={handlePhotoSave} />
    </div>
  );
}

function MobileEditor({ mode, onModeChange, previewPanel, chatPanel }: {
  mode: EditMode;
  onModeChange: (m: EditMode) => void;
  previewPanel: React.ReactNode;
  chatPanel: React.ReactNode;
}) {
  const { t } = useLocale();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      {/* Bottom bar with edit mode toggle + preview button */}
      <div className="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 gap-2">
        <button onClick={() => onModeChange("agent")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${mode === "agent" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
          <MessageCircle className="w-3.5 h-3.5" /> {t("editor.aiChat")}
        </button>
        <button onClick={() => onModeChange("manual")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${mode === "manual" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
          <FileText className="w-3.5 h-3.5" /> {t("editor.manual")}
        </button>
        <button onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
          <Eye className="w-3.5 h-3.5" /> {t("editor.preview")}
        </button>
      </div>
      {/* Edit panel (default) */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ background: "var(--panel-bg)" }}>
        {chatPanel}
      </div>
      {/* Preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("editor.preview")}</span>
            <button onClick={() => setShowPreview(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {previewPanel}
          </div>
        </div>
      )}
    </>
  );
}
