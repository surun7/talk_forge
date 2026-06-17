"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus, Trash2 } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function ExperienceSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const setOpenItems = (id: string) => {
    const key = `exp_${id}`;
    // We track open state via parent — use a simple inline toggle hack
    // Actually, openItems was managed by ManualEditor. We'll pass a different mechanism.
    // For now, use a direct state approach via props.
  };

  return (<>
    <SectionHeader title={sectionTitle("experience", "EXPERIENCE")} count={resume.experience.length} icon={sectionIconEl("experience", "briefcase")} open={!!openSections.experience} onToggle={() => toggle("experience")}
      visible={visible("experience")} onToggleVisibility={() => togVis("experience")} sectionKey="experience" onTitleChange={sLabel}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.experience}>
      <div className="px-2 pb-3 space-y-1">
        {resume.experience.map(exp => (
          <CollapsibleItem key={exp.id} title={exp.company || "New Experience"} subtitle={exp.position} open={!!openSections[exp.id]} onToggle={() => toggle(exp.id)} onDelete={() => { onChange({ ...resume, experience: resume.experience.filter(x => x.id !== exp.id) }); }}>
            <Field label="Company"><input className={inputCls} value={exp.company} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Position"><input className={inputCls} value={exp.position} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, position: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="City"><input className={inputCls} value={exp.city} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, city: e.target.value } : x) })} /></Field></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Start Date"><input className={inputCls} value={exp.startDate} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, startDate: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="End Date"><input className={inputCls} value={exp.endDate} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, endDate: e.target.value } : x) })} placeholder="Present" /></Field></div>
            </div>
            <Field label="URL"><input className={inputCls} value={exp.url} onChange={e => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, url: e.target.value } : x) })} /></Field>
            <FormattedField label="Description" value={exp.description} onChange={v => onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, description: v } : x) })} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Highlights</span>
              {exp.highlights.map((h, i) => (
                <div key={i} className="flex gap-1.5 items-center mb-2">
                  <input className={inputCls} value={h} onChange={e => {
                    const hl = [...exp.highlights]; hl[i] = e.target.value;
                    onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: hl } : x) });
                  }} placeholder="Key achievement..." />
                  <button onClick={() => {
                    onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: exp.highlights.filter((_, j) => j !== i) } : x) });
                  }} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => {
                onChange({ ...resume, experience: resume.experience.map(x => x.id === exp.id ? { ...x, highlights: [...x.highlights, ""] } : x) });
              }} className={btnCls}><Plus className="w-3 h-3" />Add Highlight</button>
            </div>
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, experience: [...resume.experience, { id: nextId(), company: "", position: "", city: "", url: "", startDate: "", endDate: "", description: "", highlights: [] }] })} className={btnCls}><Plus className="w-3 h-3" />Add Experience</button>
      </div>
    </AnimatedSection>
  </>);
}
