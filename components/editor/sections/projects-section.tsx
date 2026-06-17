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

export default function ProjectsSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <SectionHeader title={sectionTitle("projects", "PROJECTS")} count={resume.projects.length} icon={sectionIconEl("projects", "folder-git")} open={!!openSections.projects} onToggle={() => toggle("projects")}
      visible={visible("projects")} onToggleVisibility={() => togVis("projects")} sectionKey="projects" onTitleChange={sLabel}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.projects}>
      <div className="px-2 pb-3 space-y-1">
        {resume.projects.map(proj => (
          <CollapsibleItem key={proj.id} title={proj.name || "New Project"} subtitle={proj.role} open={!!openSections[proj.id]} onToggle={() => toggle(proj.id)} onDelete={() => onChange({ ...resume, projects: resume.projects.filter(x => x.id !== proj.id) })}>
            <Field label="Name"><input className={inputCls} value={proj.name} onChange={e => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, name: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Role"><input className={inputCls} value={proj.role} onChange={e => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, role: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="URL"><input className={inputCls} value={proj.url} onChange={e => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, url: e.target.value } : x) })} /></Field></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Start Date"><input className={inputCls} value={proj.startDate} onChange={e => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, startDate: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="End Date"><input className={inputCls} value={proj.endDate} onChange={e => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, endDate: e.target.value } : x) })} /></Field></div>
            </div>
            <FormattedField label="Description" value={proj.description} onChange={v => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, description: v } : x) })} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Technologies</span>
              {proj.technologies.map((t, i) => (
                <div key={i} className="flex gap-1.5 items-center mb-2">
                  <input className={inputCls} value={t} onChange={e => {
                    const tech = [...proj.technologies]; tech[i] = e.target.value;
                    onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, technologies: tech } : x) });
                  }} />
                  <button onClick={() => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, technologies: proj.technologies.filter((_, j) => j !== i) } : x) })} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => onChange({ ...resume, projects: resume.projects.map(x => x.id === proj.id ? { ...x, technologies: [...x.technologies, ""] } : x) })} className={btnCls}><Plus className="w-3 h-3" />Add Tech</button>
            </div>
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, projects: [...resume.projects, { id: nextId(), name: "", role: "", startDate: "", endDate: "", description: "", url: "", technologies: [] }] })} className={btnCls}><Plus className="w-3 h-3" />Add Project</button>
      </div>
    </AnimatedSection>
  </>);
}
