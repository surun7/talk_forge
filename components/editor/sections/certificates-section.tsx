"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema"; import { nextId } from "@/lib/resume-schema"; import { Plus } from "lucide-react";
import { AnimatedSection, SectionHeader, Field, CollapsibleItem, FormattedField, inputCls, btnCls } from "../shared";
import { useLocale } from "@/lib/locale-provider";
interface Props { resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>; toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void; sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode; sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void; onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean; }
export default function CertificatesSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const { t } = useLocale();
  function moveItem(idx: number, dir: number) { const arr = [...resume.certificates]; const target = idx + dir; if (target < 0 || target >= arr.length) return; const a = arr[idx]!, b = arr[target]!; arr[idx] = b; arr[target] = a; onChange({ ...resume, certificates: arr }); }
  function updateCert(id: string, patch: Record<string, unknown>) { onChange({ ...resume, certificates: resume.certificates.map(x => x.id === id ? { ...x, ...patch } : x) }); }
  return (<><SectionHeader title={sectionTitle("certificates", "CERTIFICATES")} count={resume.certificates.length} icon={sectionIconEl("certificates", "award")} open={!!openSections.certificates} onToggle={() => toggle("certificates")} visible={visible("certificates")} onToggleVisibility={() => togVis("certificates")} sectionKey="certificates" onTitleChange={sLabel} iconKey={sIcon("certificates","award")} onIconChange={k => sIconSet("certificates",k)} onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} /><AnimatedSection open={!!openSections.certificates}><div className="px-2 pb-3 space-y-1">
    {resume.certificates.map((cert, idx) => {
      const anyCert = cert as any;
      return (<CollapsibleItem key={cert.id} title={cert.name || t("certificates.newItem")} open={!!openSections[cert.id]} onToggle={() => toggle(cert.id)} onMoveUp={() => moveItem(idx, -1)} onMoveDown={() => moveItem(idx, 1)} isFirst={idx === 0} isLast={idx === resume.certificates.length - 1} onDelete={() => onChange({ ...resume, certificates: resume.certificates.filter(x => x.id !== cert.id) })}>
        <Field label={t("certificates.name")}><input className={inputCls} value={cert.name} onChange={e => updateCert(cert.id, { name: e.target.value })} /></Field>
        <Field label={t("certificates.issuer")}><input className={inputCls} value={cert.issuer} onChange={e => updateCert(cert.id, { issuer: e.target.value })} /></Field>
        <div className="flex gap-2">
          <div className="flex-1"><Field label={t("certificates.startDate")}><input className={inputCls} value={cert.startDate || anyCert.date || ""} onChange={e => updateCert(cert.id, { startDate: e.target.value })} placeholder="2023-03" /></Field></div>
          <div className="flex-1"><Field label={t("certificates.endDate")}><input className={inputCls} value={cert.endDate || ""} onChange={e => updateCert(cert.id, { endDate: e.target.value })} disabled={cert.longTerm} placeholder={t("certificates.present")} /></Field></div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none mt-1 mb-2">
          <input type="checkbox" checked={cert.longTerm} onChange={e => updateCert(cert.id, { longTerm: e.target.checked })} className="rounded" />
          {t("certificates.longTerm")}
        </label>
        <Field label={t("certificates.url")}><input className={inputCls} value={cert.url} onChange={e => updateCert(cert.id, { url: e.target.value })} /></Field>
        <FormattedField label={t("certificates.description")} value={cert.description} onChange={v => updateCert(cert.id, { description: v })} />
      </CollapsibleItem>);
    })}
    <button onClick={() => onChange({ ...resume, certificates: [...resume.certificates, { id: nextId(), name: "", issuer: "", startDate: "", endDate: "", longTerm: false, url: "", description: "" }] })} className={btnCls}><Plus className="w-3 h-3" />{t("certificates.add")}</button>
  </div></AnimatedSection></>);
}
