"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus, Trash2 } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function ExperienceSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) {
    const arr = [...resume.experience];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange({ ...resume, experience: arr });
  }
  const setOpenItems = (id: string) => {
    const key = `exp_${id}`;
    // We track open state via parent — use a simple inline toggle hack
    // Actually, openItems was managed by ManualEditor. We'll pass a different mechanism.
    // For now, use a direct state approach via props.
  };

  return (<>
    <SectionHeader title={sectionTitle("experience", "EXPERIENCE")} count={resume.experience.length} icon={sectionIconEl("experience", "briefcase")} open={!!openSections.experience} onToggle={() => toggle("experience")}
      visible={visible("experience")} onToggleVisibility={() => togVis("experience")} sectionKey="experience" onTitleChange={sLabel} iconKey={sIcon("experience","briefcase")} onIconChange={k => sIconSet("experience",k)}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.experience}>
      <div className="px-2 pb-3 space-y-1">
        {resume.experience.map((exp, idx) => (
          <CollapsibleItem key={exp.id} title={exp.company || t("experience.newItem")} open={!!openSections[exp.id]} onToggle={() => toggle(exp.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.experience.length - 1} onDelete={() => { onChange({ ...resume, experience: resume.experience.filter(x => x.id !== exp.id) }); }}>
            <Field label={t("experience.company")}><input className={inputCls} value={exp.company} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label={t("experience.position")}><input className={inputCls} value={exp.position} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, position: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label={t("experience.city")}><input className={inputCls} value={exp.city} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, city: e.target.value } : x) })} /></Field></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Field label={t("experience.startDate")}><input className={inputCls} value={exp.startDate} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, startDate: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label={t("experience.endDate")}><input className={inputCls} value={exp.endDate} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, endDate: e.target.value } : x) })} placeholder={t("experience.endDatePlaceholder")} /></Field></div>
            </div>
            <Field label={t("experience.url")}><input className={inputCls} value={exp.url} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, url: e.target.value } : x) })} /></Field>
            <FormattedField label={t("experience.description")} value={exp.description} onChange={v => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, description: v } : x) })} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">{t("experience.highlights")}</span>
              {exp.highlights.map((h, i) => (
                <div key={i} className="flex gap-1.5 items-center mb-2">
                  <input className={inputCls} value={h} onChange={e => {
                    const hl = [...exp.highlights]; hl[i] = e.target.value;
                    onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: hl } : x) });
                  }} placeholder={t("experience.highlightPlaceholder")} />
                  <button onClick={() => {
                    onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: exp.highlights.filter((_, j) => j !== i) } : x) });
                  }} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => {
                onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: [...x.highlights, ""] } : x) });
              }} className={btnCls}><Plus className="w-3 h-3" />{t("experience.addHighlight")}</button>
            </div>
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, experience: [...resume.experience, { id: nextId(), company: "", position: "", city: "", url: "", startDate: "", endDate: "", description: "", highlights: [] }] })} className={btnCls}><Plus className="w-3 h-3" />{t("experience.add")}</button>
      </div>
    </AnimatedSection>
  </>);
}
