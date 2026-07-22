"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Check, Trash2, Plus, Bold, Italic, Underline, List, ListOrdered, User, Briefcase, GraduationCap, Wrench, FolderGit2, Award, BookOpen, Languages, Star, Heart, HeartHandshake, FileText, Link, Globe, Code, Database, Cloud, Shield, Zap, PenTool, Palette, Music, Coffee, Anchor, Compass, Flag, Rocket, Target, Trophy, Sparkles, Atom, Brain, Crown, Gem } from "lucide-react";

const ICON_KEYS = ["briefcase","graduation-cap","wrench","folder-git","award","book-open","languages","star","heart","heart-handshake","user","globe","file-text","link","code","database","cloud","shield","zap","pen-tool","palette","music","rocket","target","trophy","sparkles","atom","brain","crown","gem","coffee","anchor","compass","flag"];
const ICON_MAP: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="w-3.5 h-3.5" />, "graduation-cap": <GraduationCap className="w-3.5 h-3.5" />,
  wrench: <Wrench className="w-3.5 h-3.5" />, "folder-git": <FolderGit2 className="w-3.5 h-3.5" />,
  award: <Award className="w-3.5 h-3.5" />, "book-open": <BookOpen className="w-3.5 h-3.5" />,
  languages: <Languages className="w-3.5 h-3.5" />, star: <Star className="w-3.5 h-3.5" />,
  heart: <Heart className="w-3.5 h-3.5" />, "heart-handshake": <HeartHandshake className="w-3.5 h-3.5" />,
  user: <User className="w-3.5 h-3.5" />, globe: <Globe className="w-3.5 h-3.5" />,
  "file-text": <FileText className="w-3.5 h-3.5" />, link: <Link className="w-3.5 h-3.5" />,
  code: <Code className="w-3.5 h-3.5" />, database: <Database className="w-3.5 h-3.5" />,
  cloud: <Cloud className="w-3.5 h-3.5" />, shield: <Shield className="w-3.5 h-3.5" />,
  zap: <Zap className="w-3.5 h-3.5" />, "pen-tool": <PenTool className="w-3.5 h-3.5" />,
  palette: <Palette className="w-3.5 h-3.5" />, music: <Music className="w-3.5 h-3.5" />,
  rocket: <Rocket className="w-3.5 h-3.5" />, target: <Target className="w-3.5 h-3.5" />,
  trophy: <Trophy className="w-3.5 h-3.5" />, sparkles: <Sparkles className="w-3.5 h-3.5" />,
  atom: <Atom className="w-3.5 h-3.5" />, brain: <Brain className="w-3.5 h-3.5" />,
  crown: <Crown className="w-3.5 h-3.5" />, gem: <Gem className="w-3.5 h-3.5" />,
  coffee: <Coffee className="w-3.5 h-3.5" />, anchor: <Anchor className="w-3.5 h-3.5" />,
  compass: <Compass className="w-3.5 h-3.5" />, flag: <Flag className="w-3.5 h-3.5" />,
};

function IconPickerButton({ icon, iconKey, onChange }: { icon: React.ReactNode; iconKey: string; onChange: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLSpanElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Recalculate position on scroll while open
  useEffect(() => {
    if (!open) return;
    function updatePos() {
      if (!btnRef.current || !pickerRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      pickerRef.current.style.top = (r.bottom + 4) + "px";
      pickerRef.current.style.left = r.left + "px";
    }
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    return () => window.removeEventListener("scroll", updatePos, true);
  }, [open]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    setOpen(true);
  }

  return (<span ref={btnRef}>
    <span onClick={handleClick}
      className="text-indigo-500 hover:scale-110 transition-transform cursor-pointer inline-block border-2 border-dashed border-indigo-300 rounded-md p-0.5">{icon}</span>
    {open && createPortal(
      <div ref={pickerRef} className="fixed z-[9999] bg-white dark:bg-slate-800 border border-slate-200 rounded-xl shadow-xl p-3 grid grid-cols-4 gap-2 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
        {ICON_KEYS.map(k => (<button key={k} onClick={() => { onChange(k); setOpen(false); }}
          className={`p-2 rounded-lg transition-all duration-200 ${k === iconKey ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
          <span className="[&_svg]:w-4 [&_svg]:h-4">{ICON_MAP[k]}</span></button>))}
      </div>,
      document.body
    )}
  </span>);
}

export const inputCls = "w-full text-xs rounded-lg pl-[10px] pr-[4px] py-[10px] focus:outline-none focus:shadow-[inset_0_0_0_2px_#a5b4fc] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-ring dark:shadow-ring-d";
export const btnCls = "h-8 px-3 text-xs rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium inline-flex items-center gap-1.5 shadow-ring dark:shadow-ring-d";
export { ICON_MAP };

export function AnimatedSection({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (<div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}><div className="overflow-hidden">{children}</div></div>);
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block mb-2"><span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">{label}</span>{children}</label>);
}

export function SectionHeader({
  title, count, icon, open, onToggle, visible, onToggleVisibility, eyeSpacer,
  sectionKey, onTitleChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
  iconKey, onIconChange,
}: {
  title: string; count: number; icon: React.ReactNode; open: boolean; onToggle: () => void;
  visible?: boolean; onToggleVisibility?: () => void;
  eyeSpacer?: boolean; sectionKey?: string; onTitleChange?: (key: string, value: string) => void;
  onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
  iconKey?: string; onIconChange?: (k: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const canEdit = !!(onTitleChange && sectionKey);
  return (<div className="flex items-center gap-1 pr-1">
    <div role="button" onClick={onToggle} tabIndex={0} className="flex-1 flex items-center gap-2 text-xs font-semibold py-4 pl-3 pr-10 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 transition-all duration-200 group cursor-pointer select-none relative shadow-[inset_0_0_0_2px_#c7d2fe] dark:shadow-[inset_0_0_0_2px_#4338ca] hover:shadow-[inset_0_0_0_2px_#a5b4fc]">
      {onToggleVisibility ? (<button onClick={e => { e.stopPropagation(); onToggleVisibility(); }} className={"flex items-center justify-center rounded-lg p-1 flex-shrink-0 " + (visible === false ? "text-red-400 bg-red-50 dark:bg-red-900/20 shadow-[0_0_0_1px_#fecaca] dark:shadow-[0_0_0_1px_#7f1d1d]" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-ring dark:shadow-[0_0_0_1px_#334155]")}>{visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>) : eyeSpacer ? (<span className="p-1 invisible"><Eye className="w-4 h-4" /></span>) : null}
      <span className={"transition-transform duration-200 " + (open ? "rotate-0" : "-rotate-90")}><ChevronDown className="w-3 h-3 text-slate-400" /></span>
      {onIconChange && iconKey ? (<IconPickerButton icon={icon} iconKey={iconKey} onChange={onIconChange} />) : (<span className="text-indigo-500 p-0.5">{icon}</span>)}
      {editing ? (<input ref={inputRef} value={title} onChange={e => onTitleChange!(sectionKey!, e.target.value)} onKeyDown={e => { if (e.key === "Enter") setEditing(false); }} onClick={e => e.stopPropagation()} className="flex-1 text-left text-xs font-semibold bg-transparent border-0 outline-none rounded px-0.5 py-1" />) : (<span className="flex-1 text-left text-xs font-semibold">{title}</span>)}
      <div className="flex items-center gap-1 flex-shrink-0 mr-2">
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (canEdit ? (editing ? "shadow-[0_0_0_1px_#a7f3d0] text-emerald-500" : "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]") : "opacity-0 pointer-events-none")}>
          {editing ? <button onClick={e => { e.stopPropagation(); setEditing(false); }} className="w-full h-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
            : <button onClick={e => { e.stopPropagation(); setEditing(true); }} className="w-full h-full flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>}
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onMoveUp ? "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onMoveUp?.(); }} disabled={!onMoveUp || isFirst} className="w-full h-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp className="w-3.5 h-3.5" /></button>
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onMoveDown ? "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onMoveDown?.(); }} disabled={!onMoveDown || isLast} className="w-full h-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onDelete ? "shadow-ring text-slate-400 hover:text-red-400 hover:shadow-[0_0_0_1px_#fca5a5]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onDelete?.(); }} className="w-full h-full flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <span className="w-5 h-5 text-[10px] text-slate-400 dark:text-slate-300 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2">{count}</span>
    </div>
  </div>);
}

export function CollapsibleItem({ title, subtitle, open, onToggle, onDelete, onMoveUp, onMoveDown, isFirst, isLast, children }: {
  title: string; subtitle?: string; open: boolean; onToggle: () => void; onDelete?: () => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
  children: React.ReactNode;
}) {
  return (<div className={"border-2 rounded-xl transition-all duration-300 " + (open ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 hover:shadow-sm")}>
    <div role="button" tabIndex={0} onClick={onToggle} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-200 cursor-pointer">
      <span className={"transition-transform duration-300 " + (open ? "rotate-0" : "-rotate-90")}><ChevronDown className="w-3 h-3 text-slate-400" /></span>
      <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{title}</span>
      {subtitle && <span className="text-[10px] text-slate-400">{subtitle}</span>}
      <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        {onMoveUp && (
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp className="w-3 h-3" /></button>
        )}
        {onMoveDown && (
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown className="w-3 h-3" /></button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
        )}
      </div>
    </div>
    <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}><div className="overflow-hidden"><div className="px-3 pt-2 pb-3 space-y-1">{children}</div></div></div>
  </div>);
}

export function FormattedField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const emitRef = useRef(onChange); emitRef.current = onChange;
  const [inList, setInList] = useState<"ul" | "ol" | null>(null);

  // Always sync external value, restore cursor at end if focused
  useEffect(() => {
    const el = ref.current;
    if (!el || el.innerHTML === value) return;
    const hadFocus = document.activeElement === el;
    el.innerHTML = value;
    if (hadFocus) {
      requestAnimationFrame(() => {
        el.focus();
        const sel = window.getSelection();
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(r);
      });
    }
  }, [value]);

  const sync = () => {
    const el = ref.current; if (!el) return;
    const newHtml = el.innerHTML;
    // Skip if content unchanged (prevents loops from external sync)
    if (newHtml === value) return;
    emitRef.current(newHtml);
    setInList(detectList());
  };

  function detectList(): "ul" | "ol" | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let el: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (el && el !== ref.current) {
      if (el.nodeType === 1) {
        const tag = (el as HTMLElement).tagName;
        if (tag === "UL") return "ul";
        if (tag === "OL") return "ol";
      }
      el = el.parentNode;
    }
    return null;
  }

  function exec(cmd: string) {
    const el = ref.current; if (!el) return;
    el.focus();
    document.execCommand(cmd, false);
    sync();
  }

  function toggleList(type: "ul" | "ol") {
    const editor = ref.current; if (!editor) return;
    editor.focus();
    const state = detectList();
    const cmd = type === "ul" ? "insertUnorderedList" : "insertOrderedList";

    if (state === type) {
      // Same type → toggle off (native execCommand handles unwrapping)
      document.execCommand(cmd, false);
    } else if (state !== null) {
      // Different list type → toggle off current, then toggle on target
      document.execCommand(state === "ul" ? "insertUnorderedList" : "insertOrderedList", false);
      document.execCommand(cmd, false);
    } else {
      // Not in list → create (native execCommand wraps selection in <ul>/<ol>)
      document.execCommand(cmd, false);
    }
    sync();
  }

  const btn = "w-6 h-6 flex items-center justify-center rounded transition-colors";
  const btnOn = "text-indigo-600 bg-indigo-50";
  const btnOff = "text-slate-400 hover:text-indigo-500 hover:bg-white";
  const eCls = "w-full text-xs rounded-lg px-3 py-[10px] focus:outline-none focus:shadow-[inset_0_0_0_2px_#a5b4fc] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[80px] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 shadow-ring dark:shadow-ring-d";

  return (<div className="mb-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-0.5">
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("bold"); }} className={`${btn} ${btnOff}`} title="Bold"><Bold className="w-3 h-3" /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} className={`${btn} ${btnOff}`} title="Italic"><Italic className="w-3 h-3" /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} className={`${btn} ${btnOff}`} title="Underline"><Underline className="w-3 h-3" /></button>
        <span className="w-px h-4 bg-slate-200 mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); toggleList("ul"); }} className={`${btn} ${inList === "ul" ? btnOn : btnOff}`} title="Bullet List"><List className="w-3 h-3" /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); toggleList("ol"); }} className={`${btn} ${inList === "ol" ? btnOn : btnOff}`} title="Numbered List"><ListOrdered className="w-3 h-3" /></button>
      </div>
    </div>
    <div ref={ref} className={eCls} contentEditable suppressContentEditableWarning onInput={sync} onKeyUp={sync}
      onPaste={e => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
        sync();
      }} />
  </div>);
}
