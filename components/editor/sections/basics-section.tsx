"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { Camera, User, Trash2, Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, inputCls, btnCls } from "../shared";

interface Props {
  resume: Resume;
  onChange: (r: Resume) => void;
  onOpenPhotoModal: () => void;
  openSections: Record<string, boolean>;
  toggle: (k: string) => void;
  sectionTitle: (k: string, f: string) => string;
  sectionIconEl: (k: string, f: string) => React.ReactNode;
  upBasic: (f: string, v: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function BasicsSection({ resume, onChange, onOpenPhotoModal, openSections, toggle, sectionTitle, sectionIconEl, upBasic, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <div className="px-2 pb-3">
      <button onClick={onOpenPhotoModal} className="flex items-center justify-center gap-2 text-xs font-semibold w-full py-4 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 bg-slate-50 dark:bg-slate-800/60 shadow-[0_0_0_2px_#cbd5e1] dark:shadow-[0_0_0_2px_#334155] hover:shadow-[0_0_0_2px_#a5b4fc] dark:hover:shadow-[0_0_0_2px_#6366f1]">
        <Camera className="w-4 h-4" /> {resume.basics.photo ? "Change Photo" : "Upload Photo"}
      </button>
    </div>
    <SectionHeader title={sectionTitle("basics", "PERSONAL INFO")} count={0} icon={sectionIconEl("basics", "user")} open={!!openSections.basics} onToggle={() => toggle("basics")} eyeSpacer
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.basics}>
      <div className="px-2 pb-3 space-y-1">
        <Field label="Name"><input className={inputCls} value={resume.basics.name} onChange={e => upBasic("name", e.target.value)} placeholder="Full name" /></Field>
        <Field label="Job Title"><input className={inputCls} value={resume.basics.title || ""} onChange={e => upBasic("title", e.target.value)} placeholder="Job title" /></Field>
        <div className="flex gap-2">
          <div className="flex-1"><Field label="Email"><input className={inputCls} value={resume.basics.email} onChange={e => upBasic("email", e.target.value)} placeholder="email@example.com" /></Field></div>
          <div className="flex-1"><Field label="Phone"><input className={inputCls} value={resume.basics.phone} onChange={e => upBasic("phone", e.target.value)} /></Field></div>
        </div>
        <Field label="Location"><input className={inputCls} value={resume.basics.location} onChange={e => upBasic("location", e.target.value)} placeholder="City, Country" /></Field>
        <Field label="Birth"><input className={inputCls} value={resume.basics.birth || ""} onChange={e => upBasic("birth", e.target.value)} placeholder="e.g. 1990-06" /></Field>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Links</span>
          {resume.basics.links.map((link: any, i: number) => (
            <div key={i} className="flex gap-1.5 items-center mb-2">
              <div className="flex-1"><Field label="Label"><input className={inputCls} value={link.label} onChange={e => { const l = [...resume.basics.links]; l[i] = { ...l[i], label: e.target.value }; onChange({ ...resume, basics: { ...resume.basics, links: l } }); }} /></Field></div>
              <div className="flex-[2]"><Field label="URL"><input className={inputCls} value={link.url} onChange={e => { const l = [...resume.basics.links]; l[i] = { ...l[i], url: e.target.value }; onChange({ ...resume, basics: { ...resume.basics, links: l } }); }} /></Field></div>
              <button onClick={() => { const l = resume.basics.links.filter((_: any, j: number) => j !== i); onChange({ ...resume, basics: { ...resume.basics, links: l } }); }} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => { const l = [...resume.basics.links, { label: "", url: "https://" }]; onChange({ ...resume, basics: { ...resume.basics, links: l } }); }} className={btnCls}><Plus className="w-3 h-3" />Add</button>
        </div>
      </div>
    </AnimatedSection>
  </>);
}
