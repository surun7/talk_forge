"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, inputCls, btnCls } from "../shared";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function PublicationsSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <SectionHeader title={sectionTitle("publications", "PUBLICATIONS")} count={resume.publications.length} icon={sectionIconEl("publications", "book-open")} open={!!openSections.publications} onToggle={() => toggle("publications")}
      visible={visible("publications")} onToggleVisibility={() => togVis("publications")} sectionKey="publications" onTitleChange={sLabel}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.publications}>
      <div className="px-2 pb-3 space-y-1">
        {resume.publications.map(pub => (
          <CollapsibleItem key={pub.id} title={pub.title || "New Publication"} subtitle={pub.publisher || ""} open={!!openSections[pub.id]} onToggle={() => toggle(pub.id)} onDelete={() => onChange({ ...resume, publications: resume.publications.filter(x => x.id !== pub.id) })}>
            <Field label="Title"><input className={inputCls} value={pub.title} onChange={e => onChange({ ...resume, publications: resume.publications.map(x => x.id === pub.id ? { ...x, title: e.target.value } : x) })} /></Field>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Author"><input className={inputCls} value={pub.author || ""} onChange={e => onChange({ ...resume, publications: resume.publications.map(x => x.id === pub.id ? { ...x, author: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="Publisher"><input className={inputCls} value={pub.publisher || ""} onChange={e => onChange({ ...resume, publications: resume.publications.map(x => x.id === pub.id ? { ...x, publisher: e.target.value } : x) })} /></Field></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Field label="Date"><input className={inputCls} value={pub.date} onChange={e => onChange({ ...resume, publications: resume.publications.map(x => x.id === pub.id ? { ...x, date: e.target.value } : x) })} /></Field></div>
              <div className="flex-1"><Field label="URL"><input className={inputCls} value={pub.url} onChange={e => onChange({ ...resume, publications: resume.publications.map(x => x.id === pub.id ? { ...x, url: e.target.value } : x) })} /></Field></div>
            </div>
          </CollapsibleItem>
        ))}
        <button onClick={() => onChange({ ...resume, publications: [...resume.publications, { id: nextId(), title: "", author: "", publisher: "", date: "", url: "" }] })} className={btnCls}><Plus className="w-3 h-3" />Add Publication</button>
      </div>
    </AnimatedSection>
  </>);
}
