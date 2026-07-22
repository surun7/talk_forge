"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema"; import { nextId } from "@/lib/resume-schema"; import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";
interface Props { resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>; toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void; sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode; sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean; }
export default function LanguagesSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) { const arr = [...resume.languages]; const target = idx + dir; if (target < 0 || target >= arr.length) return; const a = arr[idx]!, b = arr[target]!; arr[idx] = b; arr[target] = a; onChange({ ...resume, languages: arr }); }
  return (<><SectionHeader title={sectionTitle("languages", "LANGUAGES")} count={resume.languages.length} icon={sectionIconEl("languages", "languages")} open={!!openSections.languages} onToggle={() => toggle("languages")} visible={visible("languages")} onToggleVisibility={() => togVis("languages")} sectionKey="languages" onTitleChange={sLabel} iconKey={sIcon("languages","languages")} onIconChange={k => sIconSet("languages",k)} onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} /><AnimatedSection open={!!openSections.languages}><div className="px-2 pb-3 space-y-1">
    {resume.languages.map((lang, idx) => (<CollapsibleItem key={lang.id} title={lang.name || t("languages.newItem")} open={!!openSections[lang.id]} onToggle={() => toggle(lang.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.languages.length - 1} onDelete={() => onChange({ ...resume, languages: resume.languages.filter(x => x.id !== lang.id) })}>
      <div className="flex gap-2"><div className="flex-1"><Field label={t("languages.language")}><input className={inputCls} value={lang.name} onChange={e => onChange({ ...resume, languages: resume.languages.map(x => x.id === lang.id ? { ...x, name: e.target.value } : x) })} /></Field></div><div className="flex-1"><Field label={t("languages.level")}><input className={inputCls} value={lang.level} onChange={e => onChange({ ...resume, languages: resume.languages.map(x => x.id === lang.id ? { ...x, level: e.target.value } : x) })} /></Field></div></div>
    </CollapsibleItem>))}
    <button onClick={() => onChange({ ...resume, languages: [...resume.languages, { id: nextId(), name: "", level: "" }] })} className={btnCls}><Plus className="w-3 h-3" />{t("languages.add")}</button>
  </div></AnimatedSection></>);
}
