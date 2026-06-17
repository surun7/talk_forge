"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Check, Trash2, Plus, Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

export const inputCls = "w-full text-xs rounded-lg pl-[10px] pr-[4px] py-[10px] focus:outline-none focus:shadow-[inset_0_0_0_2px_#a5b4fc] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-ring dark:shadow-ring-d";
export const btnCls = "h-8 px-3 text-xs rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium inline-flex items-center gap-1.5 shadow-ring dark:shadow-ring-d";

export function AnimatedSection({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (<div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}><div className="overflow-hidden">{children}</div></div>);
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block mb-2"><span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">{label}</span>{children}</label>);
}

export function SectionHeader({
  title, count, icon, open, onToggle, visible, onToggleVisibility, eyeSpacer,
  sectionKey, onTitleChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  title: string; count: number; icon: React.ReactNode; open: boolean; onToggle: () => void;
  visible?: boolean; onToggleVisibility?: () => void;
  eyeSpacer?: boolean; sectionKey?: string; onTitleChange?: (key: string, value: string) => void;
  onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const canEdit = !!(onTitleChange && sectionKey);
  return (<div className="flex items-center gap-1 pr-1">
    <div role="button" onClick={onToggle} tabIndex={0} className="flex-1 flex items-center gap-2 text-xs font-semibold py-4 pl-3 pr-10 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 transition-all duration-200 group cursor-pointer select-none relative shadow-[inset_0_0_0_2px_#c7d2fe] dark:shadow-[inset_0_0_0_2px_#4338ca] hover:shadow-[inset_0_0_0_2px_#a5b4fc]">
      {onToggleVisibility ? (<button onClick={e => { e.stopPropagation(); onToggleVisibility(); }} className={"flex items-center justify-center rounded-lg p-1 flex-shrink-0 " + (visible === false ? "text-red-400 bg-red-50 shadow-[0_0_0_1px_#fecaca]" : "text-slate-400 hover:text-slate-600 hover:bg-white shadow-ring")}>{visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>) : eyeSpacer ? (<span className="p-1 invisible"><Eye className="w-4 h-4" /></span>) : null}
      <span className={"transition-transform duration-200 " + (open ? "rotate-0" : "-rotate-90")}><ChevronDown className="w-3 h-3 text-slate-400" /></span>
      <span className="text-indigo-500 p-0.5">{icon}</span>
      {editing ? (<input ref={inputRef} value={title} onChange={e => onTitleChange!(sectionKey!, e.target.value)} onKeyDown={e => { if (e.key === "Enter") setEditing(false); }} onClick={e => e.stopPropagation()} className="flex-1 text-left text-xs font-semibold bg-transparent border-0 outline-none rounded px-0.5 py-1" />) : (<span className="flex-1 text-left">{title}</span>)}
      <div className="flex items-center gap-1 flex-shrink-0 mr-2">
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (canEdit ? (editing ? "shadow-[0_0_0_1px_#a7f3d0] text-emerald-500" : "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]") : "opacity-0 pointer-events-none")}>
          {editing ? <button onClick={e => { e.stopPropagation(); setEditing(false); }} className="w-full h-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
            : <button onClick={e => { e.stopPropagation(); setEditing(true); }} className="w-full h-full flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>}
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onMoveUp && !isFirst ? "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onMoveUp?.(); }} disabled={isFirst} className="w-full h-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp className="w-3.5 h-3.5" /></button>
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onMoveDown && !isLast ? "shadow-ring text-slate-400 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#cbd5e1]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onMoveDown?.(); }} disabled={isLast} className="w-full h-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
        <div className={"w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 " + (onDelete ? "shadow-ring text-slate-400 hover:text-red-400 hover:shadow-[0_0_0_1px_#fca5a5]" : "opacity-0 pointer-events-none")}>
          <button onClick={e => { e.stopPropagation(); onDelete?.(); }} className="w-full h-full flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <span className="w-5 h-5 text-[10px] text-slate-400 dark:text-slate-300 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2">{count}</span>
    </div>
  </div>);
}

export function CollapsibleItem({ title, subtitle, open, onToggle, onDelete, children }: {
  title: string; subtitle?: string; open: boolean; onToggle: () => void; onDelete?: () => void; children: React.ReactNode;
}) {
  return (<div className={"border-2 rounded-xl transition-all duration-300 " + (open ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 hover:shadow-sm")}>
    <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl transition-all duration-200">
      <span className={"transition-transform duration-300 " + (open ? "rotate-0" : "-rotate-90")}><ChevronDown className="w-3 h-3 text-slate-400" /></span>
      <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{title}</span>
      {subtitle && <span className="text-[10px] text-slate-400">{subtitle}</span>}
      {onDelete && <span onClick={e => { e.stopPropagation(); onDelete(); }} className="text-slate-300 hover:text-red-400 inline-block p-0.5"><Trash2 className="w-3 h-3" /></span>}
    </button>
    <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}><div className="overflow-hidden"><div className="px-3 pb-3 space-y-1">{children}</div></div></div>
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

  function selectNodeInEditor(el: HTMLElement) {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(el);
    sel.addRange(r);
    ref.current?.focus();
  }

  function selectSpanInEditor(from: HTMLElement, to: HTMLElement) {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    const r = document.createRange();
    r.setStartBefore(from);
    r.setEndAfter(to);
    sel.addRange(r);
    ref.current?.focus();
  }

  function cleanAllMarks(attr: string) {
    ref.current?.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr));
  }

  function toggleList(type: "ul" | "ol") {
    const editor = ref.current; if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const state = detectList();

    // Case: In other list → switch tag via string replace, then restore selection
    if (state !== null && state !== type) {
      const re = new RegExp(`<${state}>([\\s\\S]*?)</${state}>`, "i");
      const m = re.exec(editor.innerHTML);
      if (m) {
        const marker = `<${type} data-temp-list="1">${m[1]}</${type}>`;
        editor.innerHTML = editor.innerHTML.replace(m[0], marker);
        sync();
        const listEl = editor.querySelector("[data-temp-list]");
        if (listEl) { cleanAllMarks("data-temp-list"); selectNodeInEditor(listEl as HTMLElement); }
      }
      return;
    }
    // Case: In same list → cancel, restore selection spanning all result divs
    if (state === type) {
      const re = new RegExp(`<${type}>([\\s\\S]*?)</${type}>`, "i");
      const m = re.exec(editor.innerHTML);
      if (m) {
        const lis = m[1].match(/<li>([\s\S]*?)<\/li>/gi) || [];
        const divs = lis.map(li => {
          const inner = li.replace(/^<li>/i, "").replace(/<\/li>$/i, "");
          return `<div data-temp-list="1">${inner || "<br>"}</div>`;
        }).join("");
        editor.innerHTML = editor.innerHTML.replace(m[0], divs || `<div data-temp-list="1"><br></div>`);
        sync();
        const allDivs = editor.querySelectorAll("[data-temp-list]");
        if (allDivs.length > 0) {
          const first = allDivs[0] as HTMLElement;
          const last = allDivs[allDivs.length - 1] as HTMLElement;
          cleanAllMarks("data-temp-list");
          selectSpanInEditor(first, last);
        }
      }
      return;
    }
    // Case: Not in list → create from selection, then select the new list
    const text = sel.toString().trim();
    const lines = text ? text.split("\n").filter(l => l.trim()) : [""];
    const listHtml = `<${type} data-temp-list="1"><li>${lines.join("</li><li>")}</li></${type}>`;
    document.execCommand("insertHTML", false, listHtml);
    sync();
    const newList = editor.querySelector("[data-temp-list]");
    if (newList) { cleanAllMarks("data-temp-list"); selectNodeInEditor(newList as HTMLElement); }
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
    <div ref={ref} className={eCls} contentEditable suppressContentEditableWarning onInput={sync} onKeyUp={sync} />
  </div>);
}
