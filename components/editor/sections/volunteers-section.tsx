"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function VolunteersSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <SectionHeader title={sectionTitle("volunteers", "VOLUNTEERING")} count={resume.volunteers.length} icon={sectionIconEl("volunteers", "heart-handshake")} open={!!openSections.volunteers} onToggle={() => toggle("volunteers")}
      visible={visible("volunteers")} onToggleVisibility={() => togVis("volunteers")} sectionKey="volunteers" onTitleChange={sLabel}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.volunteers}>
      <div className="px-2 pb-3 space-y-1">
        {resume.volunteers.map(v => (
          <CollapsibleItem key={v.id} title={v.organization || "New Volunteer"} subtitle={v.role} open={!!openSections[v.id]} onToggle={() => toggle(v.id)} onDelete={() => onChange({ ...resume, volunteers: resume.volunteers.filter(x => x.id !== v.id) })}>
            <Field label="Organization"><input className={inputCls} value={v.organization} onChange={e => onChange({ ...resume, volunteers: resume.volunteers.map(x => x.id === v.id ? { ...x, organization: e.target.value } : x) })} /></Field>
            <Field label="Role"><input className={inputCls} value={v.role} onChange={e => onChange({ ...resume, volunteers: resume.volunteers.map(x => x.id === v.id ? { ...x, role: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Start Date"><input className={inputCls} value={v.startDate} onChange={e => onChange({ ...resume, volunteers: resume.volunteers.map(x => x.id === v.id ? { ...x, startDate: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="End Date"><input className={inputCls} value={v.endDate} onChange={e => onChange({ ...resume, volunteers: resume.volunteers.map(x => x.id === v.id ? { ...x, endDate: e.target.value } : x) })} /></Field></div>
            </div>
            <FormattedField label="Description" value={v.description} onChange={vDesc => onChange({ ...resume, volunteers: resume.volunteers.map(x => x.id === v.id ? { ...x, description: vDesc } : x) })} />
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, volunteers: [...resume.volunteers, { id: nextId(), organization: "", role: "", startDate: "", endDate: "", description: "" }] })} className={btnCls}><Plus className="w-3 h-3" />Add Volunteer</button>
      </div>
    </AnimatedSection>
  </>);
}
