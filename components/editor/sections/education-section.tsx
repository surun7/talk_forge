"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function EducationSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) { const arr = [...resume.education]; const target = idx + dir; if (target < 0 || target >= arr.length) return; const a = arr[idx]!, b = arr[target]!; arr[idx] = b; arr[target] = a; onChange({ ...resume, education: arr }); }
  return (<>
    <SectionHeader title={sectionTitle("education", "EDUCATION")} count={resume.education.length} icon={sectionIconEl("education", "graduation-cap")} open={!!openSections.education} onToggle={() => toggle("education")}
      visible={visible("education")} onToggleVisibility={() => togVis("education")} sectionKey="education" onTitleChange={sLabel} iconKey={sIcon("education","graduation-cap")} onIconChange={k => sIconSet("education",k)}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.education}>
      <div className="px-2 pb-3 space-y-1">
        {resume.education.map((edu, idx) => (
          <CollapsibleItem key={edu.id} title={edu.school || t("education.newItem")} open={!!openSections[edu.id]} onToggle={() => toggle(edu.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.education.length - 1} onDelete={() => onChange({ ...resume, education: resume.education.filter(x => x.id !== edu.id) })}>
            <Field label={t("education.school")}><input className={inputCls} value={edu.school} onChange={e => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, school: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label={t("education.degree")}><input className={inputCls} value={edu.degree} onChange={e => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, degree: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label={t("education.field")}><input className={inputCls} value={edu.field} onChange={e => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, field: e.target.value } : x) })} /></Field></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Field label={t("education.startDate")}><input className={inputCls} value={edu.startDate} onChange={e => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, startDate: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label={t("education.endDate")}><input className={inputCls} value={edu.endDate} onChange={e => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, endDate: e.target.value } : x) })} placeholder="Present" /></Field></div>
            </div>
            <FormattedField label={t("education.description")} value={edu.description} onChange={v => onChange({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, description: v } : x) })} />
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, education: [...resume.education, { id: nextId(), school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }] })} className={btnCls}><Plus className="w-3 h-3" />{t("education.add")}</button>
      </div>
    </AnimatedSection>
  </>);
}
