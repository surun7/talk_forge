"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus, Trash2 } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function SkillsSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) { const arr = [...resume.skills]; const target = idx + dir; if (target < 0 || target >= arr.length) return; const a = arr[idx]!, b = arr[target]!; arr[idx] = b; arr[target] = a; onChange({ ...resume, skills: arr }); }
  return (<>
    <SectionHeader title={sectionTitle("skills", "SKILLS")} count={resume.skills.length} icon={sectionIconEl("skills", "wrench")} open={!!openSections.skills} onToggle={() => toggle("skills")}
      visible={visible("skills")} onToggleVisibility={() => togVis("skills")} sectionKey="skills" onTitleChange={sLabel} iconKey={sIcon("skills","wrench")} onIconChange={k => sIconSet("skills",k)}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.skills}>
      <div className="px-2 pb-3 space-y-1">
        {resume.skills.map((cat, idx) => (
          <CollapsibleItem key={cat.id} title={cat.name || t("skills.newItem")} open={!!openSections[cat.id]} onToggle={() => toggle(cat.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.skills.length - 1} onDelete={() => onChange({ ...resume, skills: resume.skills.filter(x => x.id !== cat.id) })}>
            <Field label={t("skills.categoryName")}><input className={inputCls} value={cat.name} onChange={e => onChange({ ...resume, skills: resume.skills.map(x => x.id === cat.id ? { ...x, name: e.target.value } : x) })} /></Field>
            <div><span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">{t("skills.skills")}</span>
              {cat.skills.map((s, i) => (<div key={s.id} className="flex gap-1.5 items-center mb-2">
                <input className={inputCls} value={s.name} onChange={e => { const sk = [...cat.skills]; sk[i] = { ...sk[i]!, name: e.target.value }; onChange({ ...resume, skills: resume.skills.map(x => x.id === cat.id ? { ...x, skills: sk } : x) }); }} />
                <button onClick={() => { onChange({ ...resume, skills: resume.skills.map(x => x.id === cat.id ? { ...x, skills: cat.skills.filter((_, j) => j !== i) } : x) }); }} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>))}
              <button onClick={() => { const newSkill = { id: nextId(), name: "" }; onChange({ ...resume, skills: resume.skills.map(x => x.id === cat.id ? { ...x, skills: [...x.skills, newSkill] } : x) }); }} className={btnCls}><Plus className="w-3 h-3" />{t("skills.addSkill")}</button>
            </div>
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, skills: [...resume.skills, { id: nextId(), name: "New Category", skills: [] }] })} className={btnCls}><Plus className="w-3 h-3" />{t("skills.add")}</button>
      </div>
    </AnimatedSection>
  </>);
}
