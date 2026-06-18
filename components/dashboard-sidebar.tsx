"use client";

import { useState, useCallback } from "react";
import { PanelLeftClose, PanelLeftOpen, FolderSync, FolderDown, FolderUp, Loader2, KeyRound } from "lucide-react";
import ApiSettingsPanel from "./api-settings-panel";
import { getStorageAdapter } from "@/lib/storage";
import { resumeSchema } from "@/lib/resume-schema";

interface Props {
  onImportComplete?: () => void;
}

const isZh = typeof navigator !== "undefined" && navigator.language.startsWith("zh");

export default function DashboardSidebar({ onImportComplete }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("");

  const handleExport = useCallback(async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setExporting(true);
      setStatus("");
      const storage = getStorageAdapter();
      const projects = await storage.exportAllLocalProjects();
      const index = await storage.loadProjectsIndex();

      for (const meta of index) {
        const data = projects[meta.id];
        if (!data) continue;
        const fileName = (meta.name || "Untitled").replace(/[/\\?%*:|"<>]/g, "_") + ".json";
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
      }
      setExporting(false);
      setStatus(isZh ? `成功导出 ${index.length} 个项目` : `Exported ${index.length} project(s)`);
    } catch (e: any) {
      if (e.name === "AbortError" || e.name === "DOMException") {
        // user cancelled
      } else {
        setStatus(isZh ? "导出失败：" + e.message : "Export failed: " + e.message);
      }
      setExporting(false);
    }
  }, []);

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
      setStatus(isZh ? `成功导入 ${imported} 个项目` : `Imported ${imported} project(s)`);
      onImportComplete?.();
    } catch (e: any) {
      if (e.name === "AbortError" || e.name === "DOMException") {
        // user cancelled
      } else {
        setStatus(isZh ? "导入失败：" + e.message : "Import failed: " + e.message);
      }
      setImporting(false);
    }
  }, [onImportComplete]);

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
          {!collapsed && (isZh ? "数据管理" : "Data")}
        </div>

        {/* Export */}
        <button onClick={handleExport} disabled={exporting}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50`}
          title={collapsed ? (isZh ? "导出所有项目" : "Export all projects") : ""}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <FolderUp className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{isZh ? "导出所有项目" : "Export All"}</span>}
        </button>

        {/* Import */}
        <button onClick={handleImport} disabled={importing}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50`}
          title={collapsed ? (isZh ? "从文件夹导入" : "Import from folder") : ""}>
          {importing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <FolderDown className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{isZh ? "从文件夹导入" : "Import from Folder"}</span>}
        </button>

        {/* API Settings */}
        <button onClick={() => setShowApiSettings(true)}
          className={`flex items-center gap-3 w-full rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
          title={collapsed ? (isZh ? "API 设置" : "API Settings") : ""}>
          <KeyRound className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{isZh ? "API 设置" : "API Settings"}</span>}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`px-2 pb-2 text-[10px] text-slate-500 dark:text-slate-400 ${collapsed ? "text-center" : ""}`}>
          {status}
        </div>
      )}

      {/* Footer */}
      <div className="px-2 pb-3">
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] text-slate-400 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && <FolderSync className="w-3.5 h-3.5" />}
          {!collapsed && (isZh ? "本地文件夹存储" : "Local Folder Storage")}
        </div>
      </div>
    </div>
    <ApiSettingsPanel open={showApiSettings} onClose={() => setShowApiSettings(false)} />
  </>);
}
