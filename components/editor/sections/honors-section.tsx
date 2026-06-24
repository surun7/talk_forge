"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema"; import { nextId } from "@/lib/resume-schema"; import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";
interface Props { resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>; toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void; sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode; sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean; }
export default function HonorsSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) { const arr = [...resume.honors]; const target = idx + dir; if (target < 0 || target >= arr.length) return; [arr[idx], arr[target]] = [arr[target], arr[idx]]; onChange({ ...resume, honors: arr }); }
  return (<><SectionHeader title={sectionTitle("honors", "HONORS & AWARDS")} count={resume.honors.length} icon={sectionIconEl("honors", "award")} open={!!openSections.honors} onToggle={() => toggle("honors")} visible={visible("honors")} onToggleVisibility={() => togVis("honors")} sectionKey="honors" onTitleChange={sLabel} iconKey={sIcon("honors","award")} onIconChange={k => sIconSet("honors",k)} onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} /><AnimatedSection open={!!openSections.honors}><div className="px-2 pb-3 space-y-1">
    {resume.honors.map((h, idx) => (<CollapsibleItem key={h.id} title={h.name || t("honors.newItem")} open={!!openSections[h.id]} onToggle={() => toggle(h.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.honors.length - 1} onDelete={() => onChange({ ...resume, honors: resume.honors.filter(x => x.id !== h.id) })}>
      <Field label={t("honors.name")}><input className={inputCls} value={h.name} onChange={e => onChange({ ...resume, honors: resume.honors.map(x => x.id === h.id ? { ...x, name: e.target.value } : x) })} /></Field>
      <Field label={t("honors.issuer")}><input className={inputCls} value={h.issuer} onChange={e => onChange({ ...resume, honors: resume.honors.map(x => x.id === h.id ? { ...x, issuer: e.target.value } : x) })} /></Field>
      <Field label={t("honors.date")}><input className={inputCls} value={h.date} onChange={e => onChange({ ...resume, honors: resume.honors.map(x => x.id === h.id ? { ...x, date: e.target.value } : x) })} /></Field>
      <FormattedField label={t("honors.description")} value={h.description} onChange={v => onChange({ ...resume, honors: resume.honors.map(x => x.id === h.id ? { ...x, description: v } : x) })} />
    </CollapsibleItem>))}
    <button onClick={() => onChange({ ...resume, honors: [...resume.honors, { id: nextId(), name: "", issuer: "", date: "", description: "" }] })} className={btnCls}><Plus className="w-3 h-3" />{t("honors.add")}</button>
  </div></AnimatedSection></>);
}
