"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useResumePDF } from "@/lib/use-resume-pdf";
import {
  Download, Plus, Sparkles, Sun, Moon, Minus, CaseSensitive, Bot, Pencil, ChevronDown, Loader2, Undo2, Redo2, ArrowLeft,
} from "lucide-react";

type EditMode = "agent" | "manual";

interface ToolbarProps {
  onNewResume: () => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
  projectName?: string;
  font: string;
  fontSize: number;
  accentColor: string;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onAccentColorChange: (color: string) => void;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const ACCENT_COLORS = [
  { id: "indigo", hex: "#4f46e5", label: "Indigo" },
  { id: "blue", hex: "#2563eb", label: "Blue" },
  { id: "sky", hex: "#0284c7", label: "Sky" },
  { id: "teal", hex: "#0d9488", label: "Teal" },
  { id: "emerald", hex: "#059669", label: "Emerald" },
  { id: "green", hex: "#16a34a", label: "Green" },
  { id: "amber", hex: "#d97706", label: "Amber" },
  { id: "orange", hex: "#ea580c", label: "Orange" },
  { id: "rose", hex: "#e11d48", label: "Rose" },
  { id: "pink", hex: "#db2777", label: "Pink" },
  { id: "violet", hex: "#7c3aed", label: "Violet" },
  { id: "slate", hex: "#475569", label: "Slate" },
];

const FONT_FAMILY_NAMES: Record<string, string> = {
  lora: "Lora", inter: "Inter", montserrat: "Montserrat", merriweather: "Merriweather",
  "ibm-plex-serif": "IBM Plex Serif", "crimson-pro": "Crimson Pro", "eb-garamond": "EB Garamond",
  "libre-baskerville": "Libre Baskerville", "noto-serif": "Noto Serif", "source-serif-4": "Source Serif 4",
  "fira-sans": "Fira Sans", "work-sans": "Work Sans", nunito: "Nunito", "space-grotesk": "Space Grotesk",
  "noto-sans-sc": "Noto Sans SC", "noto-serif-sc": "Noto Serif SC", "zcool-xiaowei": "ZCOOL XiaoWei",
};

const RESUME_FONTS = [
  { value: "lora", label: "Lora" }, { value: "inter", label: "Inter" },
  { value: "montserrat", label: "Montserrat" }, { value: "merriweather", label: "Merriweather" },
  { value: "ibm-plex-serif", label: "IBM Plex Serif" }, { value: "crimson-pro", label: "Crimson Pro" },
  { value: "eb-garamond", label: "EB Garamond" }, { value: "libre-baskerville", label: "Libre Baskerville" },
  { value: "noto-serif", label: "Noto Serif" }, { value: "source-serif-4", label: "Source Serif 4" },
  { value: "fira-sans", label: "Fira Sans" }, { value: "work-sans", label: "Work Sans" },
  { value: "nunito", label: "Nunito" }, { value: "space-grotesk", label: "Space Grotesk" },
  { value: "noto-sans-sc", label: "Noto Sans SC" }, { value: "noto-serif-sc", label: "Noto Serif SC" },
  { value: "zcool-xiaowei", label: "ZCOOL XiaoWei" },
];

function PillSelect({ value, onChange, options, icon, renderPrefix, loading, className }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
  icon?: React.ReactNode; renderPrefix?: (v: string) => React.ReactNode; loading?: boolean; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  }

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => (open ? setOpen(false) : handleOpen())}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`h-8 px-3 flex items-center justify-between rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 gap-1.5 ${className || ""} ${loading ? "opacity-60 pointer-events-none" : ""}`}>
        {icon}
        <span className="truncate text-[11px] flex-1 text-left">{selected?.label || value}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        {loading && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin shrink-0" />}
      </button>
      {open && createPortal(
        <><div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="fixed z-[9999] bg-white dark:bg-slate-800 shadow-lg rounded-2xl shadow-xl py-1 min-w-[160px]" style={{ top: pos.top, left: pos.left }}>
            {options.map((o, i) => (<div key={o.value}>
              {i > 0 && <div className="mx-3 border-t border-slate-100" />}
              <button onMouseDown={e => { e.preventDefault(); onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs transition-all duration-150 flex items-center gap-2 ${o.value === value ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-900/20" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
                {renderPrefix?.(o.value)}{o.label}
              </button>
            </div>))}
          </div></>, document.body)}
    </div>
  );
}

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

export default function Toolbar({
  onNewResume, previewRef, fileName, font, fontSize, accentColor,
  onFontChange, onFontSizeChange, onAccentColorChange, editMode, onEditModeChange,
  canUndo, canRedo, onUndo, onRedo, projectName,
}: ToolbarProps) {
  const { dark, toggle: toggleTheme } = useTheme();
  const { downloadPDF, isGenerating, progress } = useResumePDF({ fileName });

  useEffect(() => {
    if (isGenerating) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [isGenerating]);

  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; expanding: boolean; goingDark: boolean } | null>(null);
  const [isFontLoading, setIsFontLoading] = useState(false);

  async function handleFontChange(value: string) {
    const fontName = FONT_FAMILY_NAMES[value] || value;
    setIsFontLoading(true);
    try {
      if ("fonts" in document) {
        await Promise.race([
          document.fonts.load("1em " + fontName),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
        ]);
      }
    } catch {}
    onFontChange(value);
    setIsFontLoading(false);
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

  return (<>
    <header
      className="flex items-center justify-between h-14 px-4 flex-shrink-0 border-b"
      style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>

      {/* ── Left zone: Back + Logo + Undo/Redo + New ── */}
      <div className="flex items-center gap-2 w-[360px] shrink-0">
        <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0" title="Back to Dashboard">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate" title={projectName}>{projectName || "Talk Forge"}</span>
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 ml-1">
          <button onMouseDown={e => e.preventDefault()} onClick={onUndo} disabled={!canUndo}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onMouseDown={e => e.preventDefault()} onClick={onRedo} disabled={!canRedo}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Center zone: Font | Size | Color ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <CaseSensitive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <PillSelect value={font} onChange={handleFontChange} options={RESUME_FONTS}
            loading={isFontLoading} className="w-32" />
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onFontSizeChange(Math.max(8, fontSize - 1))}
            className="h-8 w-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-slate-700 dark:text-slate-200 font-mono">{fontSize}</span>
          <button onClick={() => onFontSizeChange(Math.min(18, fontSize + 1))}
            className="h-8 w-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === accentColor)?.hex || "#4f46e5" }} />
          <PillSelect value={accentColor} onChange={onAccentColorChange}
            options={ACCENT_COLORS.map(c => ({ value: c.id, label: c.label }))}
            renderPrefix={v => <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === v)?.hex }} />}
            className="w-24" />
        </div>
      </div>

      {/* ── Right zone: Mode | Theme | Download ── */}
      <div className="flex items-center gap-3 w-[360px] shrink-0 justify-end">
        <div className="relative flex w-40 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-md shadow-sm transition-transform duration-500"
            style={{ transform: editMode === "agent" ? "translateX(0%)" : "translateX(100%)" }} />
          <button onClick={() => onEditModeChange("agent")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-[11px] rounded-md transition-colors duration-200 font-semibold ${editMode === "agent" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
            <Bot className="w-3.5 h-3.5" /> Agent
          </button>
          <button onClick={() => onEditModeChange("manual")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-[11px] rounded-md transition-colors duration-200 font-semibold ${editMode === "manual" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
            <Pencil className="w-3.5 h-3.5" /> Manual
          </button>
        </div>
        <button ref={themeBtnRef} onClick={handleThemeToggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0" title={dark ? "Light mode" : "Dark mode"}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={downloadPDF} disabled={isGenerating}
          className="w-36 h-9 px-4 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 justify-center shrink-0">
          <Download className="w-3.5 h-3.5" />
          {isGenerating ? `${progress}%` : "Download PDF"}
        </button>
      </div>
    </header>

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

    {/* PDF overlay */}
    {isGenerating && (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center" style={{ pointerEvents: "all" }}>
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/70 backdrop-blur-md" />
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 min-w-[240px]">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Downloading</p>
          <span className="inline-flex gap-1">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progress}%</p>
        </div>
      </div>
    )}


  </>);
}
