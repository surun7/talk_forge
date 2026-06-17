"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Resume } from "@/lib/resume-schema";
import { getStorageAdapter } from "@/lib/storage";

export function useProject(projectId: string | null) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "overview", "experience", "education", "skills", "projects",
    "certificates", "publications", "languages", "honors", "hobbies", "volunteers",
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState("");

  const storage = getStorageAdapter();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load project on mount
  useEffect(() => {
    if (!projectId) { setIsLoading(false); return; }
    (async () => {
      console.log("[EDITOR INIT] loading project:", projectId);
      const data = await storage.loadProject(projectId);
      console.log("[EDITOR LOADED] data exists:", !!data, "conversations:", data?.conversations?.length);
      if (data) {
        setResume(data.resume);
        setConversations(data.conversations);
        setSectionOrder(data.sectionOrder);
        setProjectName(data.resume.basics.name || "");
      }
      setIsLoading(false);
    })();
  }, [projectId]);

  // Auto-save with 800ms debounce — reads latest from closure-refs
  const debouncedSave = useCallback(() => {
    if (!projectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const r = resumeRef.current;
      const c = conversationsRef.current;
      const s = sectionOrderRef.current;
      if (!r) return;
      console.log("[AUTOSAVE EXEC] saving conversations:", c?.length);
      storage.saveProject(projectId, { resume: r, conversations: c, sectionOrder: s });
      setProjectName(r.basics.name || "");
    }, 800);
  }, [projectId]);

  // Individual refs for each piece of state
  const resumeRef = useRef(resume);
  const conversationsRef = useRef(conversations);
  const sectionOrderRef = useRef(sectionOrder);
  useEffect(() => { resumeRef.current = resume; conversationsRef.current = conversations; sectionOrderRef.current = sectionOrder; }, [resume, conversations, sectionOrder]);

  // Auto-save on data changes (save even if conversations is empty)
  useEffect(() => { if (resume && !isLoading) debouncedSave(); }, [resume, debouncedSave, isLoading]);
  useEffect(() => {
    if (!isLoading) { console.log("[AUTOSAVE TRIGGER] projectId:", projectId, "conversations count:", conversations?.length, "firstMsg:", conversations?.[0]?.messages?.[0]?.content?.slice(0, 20)); debouncedSave(); }
  }, [conversations, debouncedSave, isLoading]);
  useEffect(() => { if (!isLoading) debouncedSave(); }, [sectionOrder, debouncedSave, isLoading]);



  // Save on unload — use storage adapter for proper persistence
  useEffect(() => {
    const handler = () => {
      const r = resumeRef.current; const c = conversationsRef.current; const s = sectionOrderRef.current;
      if (!r || !projectId) return;
      // Synchronous write bypassing async adapter
      try {
        const key = "talk_forge_project_" + projectId;
        localStorage.setItem(key, JSON.stringify({ resume: r, conversations: c, sectionOrder: s }));
        console.log("[UNLOAD SAVE] conversations:", c?.length);
      } catch { console.error("[UNLOAD SAVE FAILED]"); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [projectId]);

  const wrappedSetResume = useCallback((action: React.SetStateAction<Resume>) => {
    setResume(action as React.SetStateAction<Resume | null>);
  }, []) as React.Dispatch<React.SetStateAction<Resume>>;

  return {
    projectId,
    projectName,
    resume,
    setResume: wrappedSetResume,
    conversations,
    setConversations,
    sectionOrder,
    setSectionOrder,
    isLoading,
    saveNow: debouncedSave,
  };
}
