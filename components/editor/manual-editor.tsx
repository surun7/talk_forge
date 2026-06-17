"use client";
import React, { useState } from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus, Star, User, FileText, Briefcase, GraduationCap, Wrench, FolderGit2, Award, BookOpen, Languages, Heart, HeartHandshake } from "lucide-react";
import { SectionHeader, AnimatedSection, btnCls } from "./shared";
import { sectionComponents } from "./section-render-map";

const ICON_MAP: Record<string, React.ReactNode> = {
  user: <User className="w-3.5 h-3.5" />, briefcase: <Briefcase className="w-3.5 h-3.5" />,
  "graduation-cap": <GraduationCap className="w-3.5 h-3.5" />, wrench: <Wrench className="w-3.5 h-3.5" />,
  "folder-git": <FolderGit2 className="w-3.5 h-3.5" />, award: <Award className="w-3.5 h-3.5" />,
  "book-open": <BookOpen className="w-3.5 h-3.5" />, languages: <Languages className="w-3.5 h-3.5" />,
  star: <Star className="w-3.5 h-3.5" />, heart: <Heart className="w-3.5 h-3.5" />,
  "heart-handshake": <HeartHandshake className="w-3.5 h-3.5" />, "file-text": <FileText className="w-3.5 h-3.5" />,
};

interface Props {
  resume: Resume; onChange: (r: Resume) => void; onOpenPhotoModal: () => void;
  sectionOrder: string[]; onMoveSectionUp: (k: string) => void; onMoveSectionDown: (k: string) => void;
}

export default function ManualEditor({ resume, onChange, onOpenPhotoModal, sectionOrder, onMoveSectionUp, onMoveSectionDown }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setOpenSections(s => ({ ...s, [k]: !s[k] }));
  const visible = (k: string) => !(resume.basics.hiddenSections || []).includes(k);
  const togVis = (k: string) => {
    const h = resume.basics.hiddenSections || [];
    onChange({ ...resume, basics: { ...resume.basics, hiddenSections: h.includes(k) ? h.filter(x => x !== k) : [...h, k] } });
  };
  const sTitle = (k: string, f: string) => ((resume.basics.sectionLabels || {}) as Record<string, string>)[k] ?? f;
  const sLabel = (k: string, v: string) => {
    const l = (resume.basics.sectionLabels || {}) as Record<string, string>;
    onChange({ ...resume, basics: { ...resume.basics, sectionLabels: { ...l, [k]: v } } });
  };
  const sIcon = (k: string, f: string) => ((resume.basics.sectionIcons || {}) as Record<string, string>)[k] || f;
  const sIconSet = (k: string, v: string) => {
    const ic = (resume.basics.sectionIcons || {}) as Record<string, string>;
    onChange({ ...resume, basics: { ...resume.basics, sectionIcons: { ...ic, [k]: v } } });
  };
  const sIconEl = (k: string, f: string) => ICON_MAP[sIcon(k, f)] || ICON_MAP[f];
  const upBasic = (f: string, v: string) => onChange({ ...resume, basics: { ...resume.basics, [f]: v } });
  const addL = (k: keyof Resume, item: any) => onChange({ ...resume, [k]: [...(resume[k] as any[]), item] } as Resume);

  const commonProps = { resume, onChange, openSections, toggle, visible, togVis, sectionTitle: sTitle, sectionIconEl: sIconEl, sLabel, upBasic };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-800/20">
      {/* Basics always first, no move */}
      {React.createElement(sectionComponents.basics, { ...commonProps, onOpenPhotoModal, key: "basics" })}
      {/* Dynamic sections */}
      {sectionOrder.map(key => {
        const Comp = sectionComponents[key];
        if (!Comp || key === "basics") return null;
        const idx = sectionOrder.indexOf(key);
        return React.createElement(Comp, { ...commonProps, key, onMoveUp: () => onMoveSectionUp(key), onMoveDown: () => onMoveSectionDown(key), isFirst: idx === 0, isLast: idx === sectionOrder.length - 1 });
      })}
      {/* Custom sections */}
      {resume.customSections.map(sec => (
        <React.Fragment key={sec.id}>
          <SectionHeader title={sec.title} count={sec.items.length} icon={ICON_MAP[sec.icon] || <Star className="w-3.5 h-3.5" />} open={!!openSections[sec.id]} onToggle={() => toggle(sec.id)} onDelete={() => onChange({ ...resume, customSections: resume.customSections.filter(x => x.id !== sec.id) })} />
          <AnimatedSection open={!!openSections[sec.id]}><div className="px-2 pb-3"><p className="text-xs text-slate-400">Custom section content</p></div></AnimatedSection>
        </React.Fragment>
      ))}
      <button onClick={() => addL("customSections", { id: "cs_" + nextId(), title: "NEW SECTION", icon: "star", description: "", items: [] })} className={btnCls}><Plus className="w-3 h-3" />Add Section</button>
    </div>
  );
}
