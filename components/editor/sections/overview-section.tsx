"use client";
import React from "react";
import type { Resume } from "@/lib/resume-schema";
import { AnimatedSection, SectionHeader, Field, FormattedField } from "../shared";

interface Props {
  resume: Resume; onChange: (r: Resume) => void; openSections: Record<string, boolean>;
  toggle: (k: string) => void; visible: (k: string) => boolean; togVis: (k: string) => void;
  sectionTitle: (k: string, f: string) => string; sectionIconEl: (k: string, f: string) => React.ReactNode;
  sLabel: (k: string, v: string) => void; sIcon: (k: string, f: string) => string; sIconSet: (k: string, v: string) => void; upBasic: (f: string, v: string) => void;
  onMoveUp?: () => void; onMoveDown?: () => void; isFirst?: boolean; isLast?: boolean;
}

export default function OverviewSection({ resume, onChange, openSections, toggle, visible, togVis, sectionTitle, sectionIconEl, sLabel, upBasic, sIcon, sIconSet, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  return (<>
    <SectionHeader title={sectionTitle("overview", "OVERVIEW")} count={0} icon={sectionIconEl("overview", "file-text")} open={!!openSections.overview} onToggle={() => toggle("overview")}
      visible={visible("overview")} onToggleVisibility={() => togVis("overview")} sectionKey="overview" onTitleChange={sLabel} iconKey={sIcon("overview","file-text")} onIconChange={k => sIconSet("overview",k)}
      onMoveUp={onMoveUp} onMoveDown={onMoveDown} isFirst={isFirst} isLast={isLast} />
    <AnimatedSection open={!!openSections.overview}>
      <div className="px-2 pb-3">
        <FormattedField label="Summary" value={resume.basics.summary} onChange={v => upBasic("summary", v)} />
      </div>
    </AnimatedSection>
  </>);
}
