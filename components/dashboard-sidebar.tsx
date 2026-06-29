"use client";

import { useState, useCallback } from "react";
import { PanelLeftClose, PanelLeftOpen, FolderDown, Loader2, KeyRound, Download } from "lucide-react";
import ApiSettingsPanel from "./api-settings-panel";
import { getStorageAdapter } from "@/lib/storage";
import { resumeSchema } from "@/lib/resume-schema";
import { useLocale } from "@/lib/locale-provider";

interface Props {
  onImportComplete?: () => void;
}

export default function DashboardSidebar({ onImportComplete }: Props) {
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("");

  const handleExport = useCallback(async () => {
    setExporting(true);
    setStatus("");
    try {
      const storage = getStorageAdapter();
      const index = await storage.loadProjectsIndex();
      const projects = await storage.exportAllLocalProjects();

      // Bundle all projects into one downloadable JSON file
      const bundle: Record<string, any> = {};
      for (const meta of index) {
        const data = projects[meta.id];
        if (data) bundle[meta.id] = data;
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TalkForge_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus(t("sidebar.exported", { count: String(index.length) }));
    } catch (e: any) {
      setStatus(t("sidebar.exportFailed", { msg: e.message }));
    }
    setExporting(false);
  }, [t]);

  const handleImport = useCallback(async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setImporting(true);
      setStatus("");
      const storage = getStorageAdapter();
      let imported = 0;

      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (!name.endsWith(".json") || handle.kind !== "file") continue;
        const file = await handle.getFile();
        const text = await file.text();
        let data;
        try { data = JSON.parse(text); } catch { continue; }
        const parsed = resumeSchema.safeParse(data.resume);
        if (!parsed.success) continue;

        const { id } = await storage.createProject();
        // Overwrite the created project with imported data
        await storage.saveProject(id, {
          resume: parsed.data,
          conversations: data.conversations || [],
          sectionOrder: data.sectionOrder || ["overview","experience","education","skills","projects","certificates","publications","languages","honors","hobbies","volunteers"],
        });
        imported++;
      }
      setImporting(false);
      setStatus(t("sidebar.imported", { count: String(imported) }));
      onImportComplete?.();
    } catch (e: any) {
      if (e.name === "AbortError" || e.name === "DOMException") {
        // user cancelled
      } else {
        setStatus(t("sidebar.importFailed", { msg: e.message }));
      }
      setImporting(false);
    }
  }, [onImportComplete, t]);

  return (<>
    <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-12" : "w-56"}`}>
      {/* Toggle button */}
      <div className="flex items-center justify-end p-2">
        <button onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-slate-400 uppercase tracking-wider ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && t("sidebar.dataManagement")}
        </div>

        {/* Export */}
        <button onClick={handleExport} disabled={exporting}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50`}
          title={collapsed ? t("sidebar.exportBackup") : ""}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{t("sidebar.exportBackup")}</span>}
        </button>

        {/* Import */}
        <button onClick={handleImport} disabled={importing}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50`}
          title={collapsed ? t("sidebar.importBackup") : ""}>
          {importing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <FolderDown className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{t("sidebar.importBackup")}</span>}
        </button>

        {/* API Settings */}
        <button onClick={() => setShowApiSettings(true)}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
          title={collapsed ? t("sidebar.apiSettings") : ""}>
          <KeyRound className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t("sidebar.apiSettings")}</span>}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`px-2 pb-2 text-[10px] text-slate-500 dark:text-slate-400 ${collapsed ? "text-center" : ""}`}>
          {status}
        </div>
      )}

    </div>
    <ApiSettingsPanel open={showApiSettings} onClose={() => setShowApiSettings(false)} />
  </>);
}
