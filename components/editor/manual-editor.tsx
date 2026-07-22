"use client";
// NOTE: Custom sections are rendered inline here rather than through the section component registry.
// Whenever a default section gets a new feature (date fields, move buttons, highlights, etc.),
// the custom-section rendering below should be updated to match so users get a consistent editing experience.
import React, { useState, useRef, useEffect } from "react";
import type { Resume } from "@/lib/resume-schema";
import { nextId } from "@/lib/resume-schema";
import { Plus, Star, Trash2 } from "lucide-react";
import { SectionHeader, AnimatedSection, btnCls, inputCls, ICON_MAP, FormattedField, CollapsibleItem, Field } from "./shared";
import { sectionComponents } from "./section-render-map";
import { useLocale } from "@/lib/locale-provider";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; onOpenPhotoModal: () => void;
  sectionOrder: string[]; onMoveSectionUp: (k: string) => void; onMoveSectionDown: (k: string) => void;
  onAddCustomSection: (id: string) => void;
}

export default function ManualEditor({ resume, onChange, onOpenPhotoModal, sectionOrder, onMoveSectionUp, onMoveSectionDown, onAddCustomSection }: Props) {
  const { t } = useLocale();
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
  const sIconEl = (k: string, f: string) => ICON_MAP[sIcon(k, f) as string] || ICON_MAP[f];
  const upBasic = (f: string, v: string) => onChange({ ...resume, basics: { ...resume.basics, [f]: v } });
  const resumeRef = useRef(resume);
  useEffect(() => { resumeRef.current = resume; }, [resume]);

  const addL = (k: keyof Resume, item: any) => {
    const r = resumeRef.current;
    onChange({ ...r, [k]: [...(r[k] as any[]), item] } as Resume);
  };

  const addingSectionRef = useRef(false);

  function moveCsItem(idx: number, dir: number) {
    const arr = [...resume.customSections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const a = arr[idx]!;
    const b = arr[target]!;
    arr[idx] = b;
    arr[target] = a;
    onChange({ ...resume, customSections: arr });
  }

  function moveCsItemInSection(sectionId: string, idx: number, dir: number) {
    const section = resume.customSections.find(s => s.id === sectionId);
    if (!section) return;
    const items = [...section.items];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[idx]!;
    const b = items[target]!;
    items[idx] = b;
    items[target] = a;
    onChange({ ...resume, customSections: resume.customSections.map(x => x.id === sectionId ? { ...x, items } : x) });
  }

  const commonProps = { resume, onChange, openSections, toggle, visible, togVis, sectionTitle: sTitle, sectionIconEl: sIconEl, sLabel, sIcon, sIconSet, upBasic };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-800/20">
      {/* Basics always first, no move */}
      {sectionComponents.basics && React.createElement(sectionComponents.basics, { ...commonProps, onOpenPhotoModal, key: "basics" })}
      {/* Dynamic sections (including custom sections) */}
      {sectionOrder.map(key => {
        const Comp = sectionComponents[key];
        const idx = sectionOrder.indexOf(key);
        if (Comp && key !== "basics") {
          return React.createElement(Comp, { ...commonProps, key, onMoveUp: () => onMoveSectionUp(key), onMoveDown: () => onMoveSectionDown(key), isFirst: idx === 0, isLast: idx === sectionOrder.length - 1 });
        }
        // Custom section: find by id
        const cs = resume.customSections.find(s => s.id === key);
        if (cs) {
          return (
            <React.Fragment key={cs.id}>
              <SectionHeader title={cs.title} count={cs.items.length} icon={ICON_MAP[cs.icon] || <Star className="w-3.5 h-3.5" />} open={!!openSections[cs.id]} onToggle={() => toggle(cs.id)} visible={visible(cs.id)} onToggleVisibility={() => togVis(cs.id)} sectionKey={cs.id} onTitleChange={(k, v) => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === k ? { ...x, title: v } : x) })} iconKey={cs.icon} onIconChange={k => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, icon: k } : x) })} onMoveUp={() => onMoveSectionUp(key)} onMoveDown={() => onMoveSectionDown(key)} isFirst={idx === 0} isLast={idx === sectionOrder.length - 1} onDelete={() => onChange({ ...resume, customSections: resume.customSections.filter(x => x.id !== cs.id) })} />
              <AnimatedSection open={!!openSections[cs.id]}>
                <div className="px-2 pb-3 space-y-1">
                  <div className="pt-1"><span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Items</span>
                    <div className="space-y-2 mb-3">
                    {cs.items.map((item: any, i2: number) => (
                      <CollapsibleItem key={item.id + "_" + i2 + "_" + cs.id} title={item.name || (item as any).text || `Item ${i2 + 1}`} open={!!openSections[item.id]} onToggle={() => toggle(item.id)} onMoveUp={() => moveCsItemInSection(cs.id, i2, -1)} onMoveDown={() => moveCsItemInSection(cs.id, i2, 1)} isFirst={i2 === 0} isLast={i2 === cs.items.length - 1} onDelete={() => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.filter((i: any) => i.id !== item.id) } : x) })}>
                        <Field label="Name"><input className={inputCls} value={item.name || (item as any).text || ""} onChange={e => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.map((i: any) => i.id === item.id ? { ...i, name: e.target.value } : i) } : x) })} /></Field>
                        <Field label="Affiliation"><input className={inputCls} value={item.affiliation || ""} onChange={e => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.map((i: any) => i.id === item.id ? { ...i, affiliation: e.target.value } : i) } : x) })} /></Field>
                        <div className="flex gap-2">
                          <div className="flex-1"><Field label="Start Date"><input className={inputCls} value={item.startDate || (item as any).time || ""} onChange={e => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.map((i: any) => i.id === item.id ? { ...i, startDate: e.target.value } : i) } : x) })} /></Field></div>
                          <div className="flex-1"><Field label="End Date"><input className={inputCls} value={item.endDate || ""} onChange={e => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.map((i: any) => i.id === item.id ? { ...i, endDate: e.target.value } : i) } : x) })} placeholder="Present" /></Field></div>
                        </div>
                        <FormattedField label="Description" value={item.description || ""} onChange={v => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: x.items.map((i: any) => i.id === item.id ? { ...i, description: v } : i) } : x) })} />
                      </CollapsibleItem>
                    ))}
                    </div>
                    <button onClick={() => onChange({ ...resume, customSections: resume.customSections.map(x => x.id === cs.id ? { ...x, items: [...x.items, { id: "csi_" + nextId(), name: "", affiliation: "", startDate: "", endDate: "", description: "" }] } : x) })} className={btnCls}><Plus className="w-3 h-3" />Add Item</button>
                  </div>
                </div>
              </AnimatedSection>
            </React.Fragment>
          );
        }
        return null;
      })}
      <button onClick={() => {
        if (addingSectionRef.current) return;
        addingSectionRef.current = true;
        setTimeout(() => { addingSectionRef.current = false; }, 300);
        const id = "cs_" + nextId();
        addL("customSections", { id, title: "NEW SECTION", icon: "star", description: "", items: [] });
      }} className={btnCls}><Plus className="w-3 h-3" />{t("editor.addSection")}</button>
    </div>
  );
}
