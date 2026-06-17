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

export default function CertificatesSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <SectionHeader title={sectionTitle("certificates", "CERTIFICATES")} count={resume.certificates.length} icon={sectionIconEl("certificates", "award")} open={!!openSections.certificates} onToggle={() => toggle("certificates")}
      visible={visible("certificates")} onToggleVisibility={() => togVis("certificates")} sectionKey="certificates" onTitleChange={sLabel}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.certificates}>
      <div className="px-2 pb-3 space-y-1">
        {resume.certificates.map(cert => (
          <CollapsibleItem key={cert.id} title={cert.name || "New Certificate"} subtitle={cert.issuer} open={!!openSections[cert.id]} onToggle={() => toggle(cert.id)} onDelete={() => onChange({ ...resume, certificates: resume.certificates.filter(x => x.id !== cert.id) })}>
            <Field label="Name"><input className={inputCls} value={cert.name} onChange={e => onChange({ ...resume, certificates: resume.certificates.map(x => x.id === cert.id ? { ...x, name: e.target.value } : x) })} /></Field>
            <Field label="Issuer"><input className={inputCls} value={cert.issuer} onChange={e => onChange({ ...resume, certificates: resume.certificates.map(x => x.id === cert.id ? { ...x, issuer: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Date"><input className={inputCls} value={cert.date} onChange={e => onChange({ ...resume, certificates: resume.certificates.map(x => x.id === cert.id ? { ...x, date: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="URL"><input className={inputCls} value={cert.url} onChange={e => onChange({ ...resume, certificates: resume.certificates.map(x => x.id === cert.id ? { ...x, url: e.target.value } : x) })} /></Field></div>
            </div>
            <FormattedField label="Description" value={cert.description} onChange={v => onChange({ ...resume, certificates: resume.certificates.map(x => x.id === cert.id ? { ...x, description: v } : x) })} />
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, certificates: [...resume.certificates, { id: nextId(), name: "", issuer: "", date: "", url: "", description: "" }] })} className={btnCls}><Plus className="w-3 h-3" />Add Certificate</button>
      </div>
    </AnimatedSection>
  </>);
}
