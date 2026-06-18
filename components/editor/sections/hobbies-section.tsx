"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema"; import { nextId } from "@/lib/resume-schema"; import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, inputCls, btnCls } from "../shared";
interface Props { resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>; toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void; sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode; sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean; }
export default function HobbiesSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  function moveItem(idx: number, dir: number) { const arr = [...resume.hobbies]; const target = idx + dir; if (target < 0 || target >= arr.length) return; [arr[idx], arr[target]] = [arr[target], arr[idx]]; onChange({ ...resume, hobbies: arr }); }
  return (<><SectionHeader title={sectionTitle("hobbies", "HOBBIES & INTERESTS")} count={resume.hobbies.length} icon={sectionIconEl("hobbies", "heart")} open={!!openSections.hobbies} onToggle={() => toggle("hobbies")} visible={visible("hobbies")} onToggleVisibility={() => togVis("hobbies")} sectionKey="hobbies" onTitleChange={sLabel} iconKey={sIcon("hobbies","heart")} onIconChange={k => sIconSet("hobbies",k)} onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} /><AnimatedSection open={!!openSections.hobbies}><div className="px-2 pb-3 space-y-1">
    {resume.hobbies.map((h, idx) => (<CollapsibleItem key={h.id} title={h.name || "New Hobby"} open={!!openSections[h.id]} onToggle={() => toggle(h.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.hobbies.length - 1} onDelete={() => onChange({ ...resume, hobbies: resume.hobbies.filter(x => x.id !== h.id) })}>
      <Field label="Name"><input className={inputCls} value={h.name} onChange={e => onChange({ ...resume, hobbies: resume.hobbies.map(x => x.id === h.id ? { ...x, name: e.target.value } : x) })} /></Field>
    </CollapsibleItem>))}
    <button onClick={() => onChange({ ...resume, hobbies: [...resume.hobbies, { id: nextId(), name: "" }] })} className={btnCls}><Plus className="w-3 h-3" />Add Hobby</button>
  </div></AnimatedSection></>);
}
