"use client";

import React, { useRef, useEffect, useState } from "react";
import type { Resume } from "@/lib/resume-schema";
import { useLocale } from "@/lib/locale-provider";
import { Mail, Phone, MapPin, Cake, MessageCircle, ExternalLink, Star } from "lucide-react";
import {
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  BookOpen,
  Wrench,
  User,
  Languages,
  Heart,
  HeartHandshake,
  Globe,
  Code,
  Database,
  Cloud,
  Shield,
  Zap,
  PenTool,
  Palette,
  Music,
  Rocket,
  Target,
  Trophy,
  Sparkles,
  Atom,
  Brain,
  Crown,
  Gem,
  Coffee,
  Anchor,
  Compass,
  Flag,
  Link,
  FileText,
} from "lucide-react";

const ACCENT_HEX: Record<string, string> = {
  indigo: "#4f46e5",
  blue: "#2563eb",
  sky: "#0284c7",
  teal: "#0d9488",
  emerald: "#059669",
  green: "#16a34a",
  amber: "#d97706",
  orange: "#ea580c",
  rose: "#e11d48",
  pink: "#db2777",
  violet: "#7c3aed",
  slate: "#475569",
};
const ACCENT_LIGHT: Record<string, string> = {
  indigo: "#eef2ff",
  blue: "#eff6ff",
  sky: "#f0f9ff",
  teal: "#f0fdfa",
  emerald: "#ecfdf5",
  green: "#f0fdf4",
  amber: "#fffbeb",
  orange: "#fff7ed",
  rose: "#fff1f2",
  pink: "#fdf2f8",
  violet: "#f5f3ff",
  slate: "#f8fafc",
};
const ACCENT_BORDER: Record<string, string> = {
  indigo: "#c7d2fe",
  blue: "#bfdbfe",
  sky: "#bae6fd",
  teal: "#99f6e4",
  emerald: "#a7f3d0",
  green: "#bbf7d0",
  amber: "#fde68a",
  orange: "#fed7aa",
  rose: "#fecdd3",
  pink: "#fbcfe8",
  violet: "#ddd6fe",
  slate: "#e2e8f0",
};

const PAGE_MM_H = 297;
const PAD_V = 20;
const PAD_H = 15;
const CONTENT_W_MM = 210 - PAD_H * 2;
const CONTENT_MM_H = PAGE_MM_H - PAD_V * 2 - 8;

function SectionHeader({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
}) {
  return (
    <h2
      className="flex items-center gap-2 text-[1.167em] font-bold uppercase tracking-wider border-b-2 pb-1.5 mb-3"
      style={{ borderColor: accent }}
    >
      <span style={{ color: accent }}>{icon}</span>
      <span className="text-slate-700">{title}</span>
    </h2>
  );
}

const FONT_FAMILIES: Record<string, string> = {
  inter: "'Inter', 'Noto Sans SC', sans-serif",
  lora: "'Lora', 'Noto Serif SC', Georgia, serif",
  montserrat: "'Montserrat', 'Noto Sans SC', sans-serif",
  merriweather: "'Merriweather', 'Noto Serif SC', Georgia, serif",
  "ibm-plex-serif": "'IBM Plex Serif', 'Noto Serif SC', Georgia, serif",
  "crimson-pro": "'Crimson Pro', 'Noto Serif SC', Georgia, serif",
  "eb-garamond": "'EB Garamond', 'Noto Serif SC', Georgia, serif",
  "libre-baskerville": "'Libre Baskerville', 'Noto Serif SC', Georgia, serif",
  "noto-serif": "'Noto Serif', 'Noto Serif SC', Georgia, serif",
  "source-serif-4": "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
  "fira-sans": "'Fira Sans', 'Noto Sans SC', sans-serif",
  "work-sans": "'Work Sans', 'Noto Sans SC', sans-serif",
  nunito: "'Nunito', 'Noto Sans SC', sans-serif",
  "space-grotesk": "'Space Grotesk', 'Noto Sans SC', sans-serif",
  "noto-sans-sc": "'Noto Sans SC', sans-serif",
  "noto-serif-sc": "'Noto Serif SC', Georgia, serif",
  "zcool-xiaowei": "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
};

function hidden(resume: Resume, key: string) {
  return (resume.basics.hiddenSections || []).includes(key);
}

const PREVIEW_ICONS: Record<string, React.ReactNode> = {
  user: <User className="w-3.5 h-3.5 a-icon" />,
  briefcase: <Briefcase className="w-3.5 h-3.5 a-icon" />,
  "graduation-cap": <GraduationCap className="w-3.5 h-3.5 a-icon" />,
  wrench: <Wrench className="w-3.5 h-3.5 a-icon" />,
  "folder-git": <FolderGit2 className="w-3.5 h-3.5 a-icon" />,
  award: <Award className="w-3.5 h-3.5 a-icon" />,
  "book-open": <BookOpen className="w-3.5 h-3.5 a-icon" />,
  languages: <Languages className="w-3.5 h-3.5 a-icon" />,
  star: <Star className="w-3.5 h-3.5 a-icon" />,
  heart: <Heart className="w-3.5 h-3.5 a-icon" />,
  "heart-handshake": <HeartHandshake className="w-3.5 h-3.5 a-icon" />,
  "file-text": <FileText className="w-3.5 h-3.5 a-icon" />,
  globe: <Globe className="w-3.5 h-3.5 a-icon" />,
  link: <Link className="w-3.5 h-3.5 a-icon" />,
  code: <Code className="w-3.5 h-3.5 a-icon" />,
  database: <Database className="w-3.5 h-3.5 a-icon" />,
  cloud: <Cloud className="w-3.5 h-3.5 a-icon" />,
  shield: <Shield className="w-3.5 h-3.5 a-icon" />,
  zap: <Zap className="w-3.5 h-3.5 a-icon" />,
  "pen-tool": <PenTool className="w-3.5 h-3.5 a-icon" />,
  palette: <Palette className="w-3.5 h-3.5 a-icon" />,
  music: <Music className="w-3.5 h-3.5 a-icon" />,
  rocket: <Rocket className="w-3.5 h-3.5 a-icon" />,
  target: <Target className="w-3.5 h-3.5 a-icon" />,
  trophy: <Trophy className="w-3.5 h-3.5 a-icon" />,
  sparkles: <Sparkles className="w-3.5 h-3.5 a-icon" />,
  atom: <Atom className="w-3.5 h-3.5 a-icon" />,
  brain: <Brain className="w-3.5 h-3.5 a-icon" />,
  crown: <Crown className="w-3.5 h-3.5 a-icon" />,
  gem: <Gem className="w-3.5 h-3.5 a-icon" />,
  coffee: <Coffee className="w-3.5 h-3.5 a-icon" />,
  anchor: <Anchor className="w-3.5 h-3.5 a-icon" />,
  compass: <Compass className="w-3.5 h-3.5 a-icon" />,
  flag: <Flag className="w-3.5 h-3.5 a-icon" />,
};

function sectionIcon(
  resume: Resume,
  key: string,
  fallback: string,
): React.ReactNode {
  const icons = resume.basics.sectionIcons as
    | Record<string, string>
    | undefined;
  const ik = (icons && icons[key]) || fallback;
  return PREVIEW_ICONS[ik] || PREVIEW_ICONS[fallback];
}

function renderRichText(html: string) {
  if (/<[a-z][\s\S]*>/i.test(html)) {
    return (
      <div
        className="[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <div className="whitespace-pre-wrap">{html.replace(/&nbsp;/g, " ")}</div>;
}

function ResumeContent({
  resume,
  sectionOrder,
}: {
  resume: Resume;
  sectionOrder: string[];
}) {
  const { t } = useLocale();
  function sectionLabel(key: string): string {
    const labels = resume.basics.sectionLabels as Record<string, string> | undefined;
    return (labels && labels[key]) || t("section." + key);
  }
  const {
    basics,
    experience,
    education,
    skills,
    projects,
    certificates,
    publications,
    languages,
    honors,
    hobbies,
    volunteers,
    customSections,
  } = resume;
  const hasLinks = basics.links.length > 0;
  const a = ACCENT_HEX[basics.accentColor] ?? ACCENT_HEX.indigo!;
  const al = ACCENT_LIGHT[basics.accentColor] ?? ACCENT_LIGHT.indigo!;
  const ab = ACCENT_BORDER[basics.accentColor] ?? ACCENT_BORDER.indigo!;
  const accentCSS = `[data-a] .a-icon{color:${a}}[data-a] .a-link{color:${a}}[data-a] .a-bullet{color:${a}}[data-a] .a-border{border-color:${al}}[data-a] .a-tag{background:${al};color:${a}}[data-a] .a-photo{background:${al}}[data-a] .a-photo-icon{color:${ab}}`;
  const previewSectionMap: Record<string, React.ReactNode> = {
    overview: (
      <>
        {basics.summary && !hidden(resume, "overview") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "overview", "file-text")}
              title={sectionLabel("overview")}
              accent={a}
            />
            <div className="text-[1em] text-slate-600 leading-relaxed">
              {renderRichText(basics.summary)}
            </div>
          </section>
        )}
      </>
    ),
    experience: (
      <>
        {experience.length > 0 && !hidden(resume, "experience") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "experience", "briefcase")}
              title={sectionLabel("experience")}
              accent={a}
            />
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {exp.company}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {exp.startDate}
                    {exp.endDate ? " — " + exp.endDate : " — Present"}
                  </span>
                </div>
                <p className="text-[1em] text-slate-500">
                  {exp.position}
                  {exp.city ? " — " + exp.city : ""}
                </p>
                {exp.url && (
                  <p className="text-[0.833em] text-slate-400 mt-0.5">
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-link underline"
                    >
                      {exp.url}
                    </a>
                  </p>
                )}
                {exp.description && (
                  <div className="text-[1em] mt-1 text-slate-600">
                    {renderRichText(exp.description)}
                  </div>
                )}
                {exp.highlights.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-[1em] text-slate-600 flex items-center gap-1.5"
                      >
                        <span className="a-bullet flex-shrink-0 leading-none">
                          ●
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    education: (
      <>
        {education.length > 0 && !hidden(resume, "education") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "education", "graduation-cap")}
              title={sectionLabel("education")}
              accent={a}
            />
            {education.map((edu) => (
              <div
                key={edu.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {edu.school}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {edu.startDate}
                    {edu.endDate ? " — " + edu.endDate : " — Present"}
                  </span>
                </div>
                <p className="text-[1em] text-slate-500">
                  {edu.degree}{edu.field && <>{" — "}{edu.field}</>}
                </p>
                {edu.description && (
                  <div className="text-[1em] mt-0.5 text-slate-600">
                    {renderRichText(edu.description)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    skills: (
      <>
        {skills.length > 0 && !hidden(resume, "skills") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "skills", "wrench")}
              title={sectionLabel("skills")}
              accent={a}
            />
            {skills.map((cat) => (
              <div key={cat.id} className="mb-2">
                <span className="text-[0.833em] font-semibold text-slate-500 uppercase tracking-wide">
                  {cat.name}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cat.skills.map((s) => (
                    <span
                      key={s.id}
                      className="text-[0.75em] px-2 py-0.5 rounded-full font-medium a-tag"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </>
    ),
    projects: (
      <>
        {projects.length > 0 && !hidden(resume, "projects") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "projects", "folder-git")}
              title={sectionLabel("projects")}
              accent={a}
            />
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {proj.name}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {proj.startDate}
                    {proj.endDate ? " — " + proj.endDate : ""}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <p className="text-[1em] text-slate-500">
                    {proj.role}
                    {proj.role && proj.affiliation && " \u2014 "}
                    {proj.affiliation}
                  </p>
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-link underline text-[0.833em]"
                    >
                      {proj.url}
                    </a>
                  )}
                </div>
                {proj.description && (
                  <div className="text-[1em] mt-0.5 text-slate-600">
                    {renderRichText(proj.description)}
                  </div>
                )}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-[0.75em] px-1.5 py-0.5 rounded-full font-medium a-tag"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    certificates: (
      <>
        {certificates.length > 0 && !hidden(resume, "certificates") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "certificates", "award")}
              title={sectionLabel("certificates")}
              accent={a}
            />
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="pb-0 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {cert.name}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {(cert as any).startDate || (cert as any).date}
                    {cert.longTerm
                      ? " — " + t("certificates.longTerm")
                      : cert.endDate
                        ? " — " + cert.endDate
                        : ((cert as any).startDate || (cert as any).date) ? " — " + t("certificates.present") : ""}
                  </span>
                </div>
                {(cert.issuer || cert.url) && (
                  <div className="flex justify-between items-baseline">
                    {cert.issuer && <p className="text-[1em] text-slate-500">{cert.issuer}</p>}
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="a-link underline text-[0.833em]"
                      >
                        {cert.url}
                      </a>
                    )}
                  </div>
                )}
                {cert.description && (
                  <div className="text-[1em] mt-0.5 text-slate-600">
                    {renderRichText(cert.description)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    publications: (
      <>
        {publications.length > 0 && !hidden(resume, "publications") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "publications", "book-open")}
              title={sectionLabel("publications")}
              accent={a}
            />
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {pub.title}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {pub.date}
                  </span>
                </div>
                {(pub.author || pub.publisher) && (
                  <p className="text-[1em] text-slate-500">
                    {pub.author}{pub.author && pub.publisher ? " \u2014 " : ""}
                    {pub.publisher}
                  </p>
                )}
                {pub.url && (
                  <p className="text-[0.833em] text-slate-400 mt-0.5">
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="a-link underline break-all">{pub.url}</a>
                  </p>
                )}
                {pub.description && (
                  <div className="text-[1em] mt-1 text-slate-600">
                    {renderRichText(pub.description)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    languages: (
      <>
        {languages.length > 0 && !hidden(resume, "languages") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "languages", "languages")}
              title={sectionLabel("languages")}
              accent={a}
            />
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="text-[1em]">
                  <span className="font-semibold text-slate-700">
                    {lang.name}
                  </span>
                  <span className="text-slate-400 ml-1.5">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    honors: (
      <>
        {honors.length > 0 && !hidden(resume, "honors") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "honors", "award")}
              title={sectionLabel("honors")}
              accent={a}
            />
            {honors.map((h) => (
              <div
                key={h.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {h.name}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {h.date}
                  </span>
                </div>
                <p className="text-[1em] text-slate-500">{h.issuer}</p>
                {h.description && (
                  <div className="text-[1em] mt-0.5 text-slate-600">
                    {renderRichText(h.description)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
    hobbies: (
      <>
        {hobbies.length > 0 && !hidden(resume, "hobbies") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "hobbies", "heart")}
              title={sectionLabel("hobbies")}
              accent={a}
            />
            <div className="flex flex-wrap gap-1">
              {hobbies.map((h) => (
                <span
                  key={h.id}
                  className="text-[0.75em] px-2 py-0.5 rounded-full font-medium a-tag"
                >
                  {h.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    volunteers: (
      <>
        {volunteers.length > 0 && !hidden(resume, "volunteers") && (
          <section className="mb-5">
            <SectionHeader
              icon={sectionIcon(resume, "volunteers", "heart-handshake")}
              title={sectionLabel("volunteers")}
              accent={a}
            />
            {volunteers.map((v) => (
              <div
                key={v.id}
                className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[1em] text-slate-800">
                    {v.organization}
                  </span>
                  <span className="text-[0.917em] text-slate-500 not-italic">
                    {v.startDate}
                    {v.endDate ? " — " + v.endDate : ""}
                  </span>
                </div>
                <p className="text-[1em] text-slate-500">{v.role}</p>
                {v.description && (
                  <div className="text-[1em] mt-1 text-slate-600">
                    {renderRichText(v.description)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </>
    ),
  };

  return (
    <>
      <style>{accentCSS}</style>
      <div data-a>
        <header className="flex justify-between items-start mb-5 pb-5 border-b">
          <div className="flex-1">
            {basics.name && (
              <h1 className="text-[2.33em] font-bold tracking-tight text-slate-800 mb-1">
                {basics.name}
              </h1>
            )}
            {basics.title && (
              <p className="text-[1.167em] text-slate-500 mb-2">
                {basics.title}
              </p>
            )}
            <div className="text-[1em] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-0.5">
              {basics.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 a-icon" /> {basics.email}
                </span>
              )}
              {basics.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 a-icon" /> {basics.phone}
                </span>
              )}
              {basics.wechat && (
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 a-icon" /> {basics.wechat}
                </span>
              )}
              {basics.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 a-icon" /> {basics.location}
                </span>
              )}
              {basics.birth && (
                <span className="inline-flex items-center gap-1">
                  <Cake className="w-3 h-3 a-icon" /> {basics.birth}
                </span>
              )}
            </div>
            {hasLinks && (
              <div className="text-[1em] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 pt-2 border-t">
                {basics.links.map((link, i) => (
                  <span
                    key={i}
                    className="inline-flex items-start gap-1 break-all"
                  >
                    <ExternalLink className="w-3 h-3 a-icon mt-0.5 flex-shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-link underline decoration-slate-300"
                    >
                      {link.label}: {link.url}
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="ml-8 flex-shrink-0">
            <div className="w-[96px] h-[112px] p-[2px] rounded-xl" style={{ background: a }}>
              <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-100 flex items-center justify-center">
                {basics.photo ? (
                  <img src={basics.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="a-photo-icon text-center leading-tight">
                    <User className="w-9 h-9 mx-auto mb-1" strokeWidth={1} />
                    <span className="text-[0.75em]">Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {sectionOrder.flatMap((key) => {
          const el = previewSectionMap[key];
          if (el) return [<React.Fragment key={key}>{el}</React.Fragment>];
          const cs = customSections.find(s => s.id === key);
          if (cs) {
            return [<React.Fragment key={cs.id}>
              <section className="mb-5">
                <SectionHeader icon={PREVIEW_ICONS[cs.icon] || <Star className="w-3.5 h-3.5 a-icon" />} title={cs.title} accent={a} />
                {cs.description && <div className="text-[1em] mt-0.5 text-slate-600">{renderRichText(cs.description)}</div>}
                {cs.items.length > 0 && (
                  <div className="space-y-3">
                    {cs.items.map((item: any, i2: number) => (
                      <div key={item.id + "_" + i2 + "_" + cs.id} className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[1em] text-slate-800">{item.name || (item as any).text}</span>
                          <span className="text-[0.917em] text-slate-500 not-italic">
                            {item.startDate || (item as any).time}
                            {item.endDate ? " — " + item.endDate : (item.startDate || (item as any).time) ? " — Present" : ""}
                          </span>
                        </div>
                        {(item.role || item.affiliation) && (
                          <p className="text-[1em] text-slate-500">
                            {item.role}
                            {item.role && item.affiliation && " \u2014 "}
                            {item.affiliation}
                          </p>
                        )}
                        {item.description && <div className="text-[1em] mt-1 text-slate-600">{renderRichText(item.description)}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </React.Fragment>];
          }
          return [];
        })}
        {/* fallback: custom sections not in sectionOrder */}
        {customSections.filter(sec => !sectionOrder.includes(sec.id)).map((sec) => (
          <section key={sec.id} className="mb-5">
            <SectionHeader icon={PREVIEW_ICONS[sec.icon] || <Star className="w-3.5 h-3.5 a-icon" />} title={sec.title} accent={a} />
            {sec.description && <div className="text-[1em] mt-0.5 text-slate-600">{renderRichText(sec.description)}</div>}
            {sec.items.length > 0 && (
              <div className="space-y-3">
                {sec.items.map((item: any, i2: number) => (
                  <div key={item.id + "_" + i2 + "_" + sec.id} className="pb-3 mb-3 pl-3 border-l-2 a-border border-b-2 border-slate-400 dark:border-slate-500">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[1em] text-slate-800">{item.name || (item as any).text}</span>
                      <span className="text-[0.917em] text-slate-500 not-italic">
                        {item.startDate || (item as any).time}
                        {item.endDate ? " — " + item.endDate : (item.startDate || (item as any).time) ? " — Present" : ""}
                      </span>
                    </div>
                    {(item.role || item.affiliation) && (
                      <p className="text-[1em] text-slate-500">
                        {item.role}
                        {item.role && item.affiliation && " \u2014 "}
                        {item.affiliation}
                      </p>
                    )}
                    {item.description && <div className="text-[1em] mt-1 text-slate-600">{renderRichText(item.description)}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

function collectBlocks(container: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const child of Array.from(container.children)) {
    const el = child as HTMLElement;
    if (el.tagName === "SECTION" || el.tagName === "HEADER") {
      for (const sub of Array.from(el.children)) {
        const subEl = sub as HTMLElement;
        if (
          (subEl.tagName === "DIV" || subEl.tagName === "UL") &&
          subEl.children.length > 0
        ) {
          const kids = Array.from(subEl.children);
          const first = kids[0];
          if (first && kids.every((k) => k.tagName === first.tagName)) {
            for (const item of kids) out.push(item as HTMLElement);
          } else {
            out.push(subEl);
          }
        } else {
          out.push(subEl);
        }
      }
    } else {
      out.push(el);
    }
  }
  return out;
}

function computeOffsets(
  contentEl: HTMLElement,
): { offsetPx: number; clipHeightPx: number }[] {
  const pxPerMm = contentEl.offsetWidth / CONTENT_W_MM;
  const contentHPx = CONTENT_MM_H * pxPerMm;
  const container = contentEl.querySelector("[data-a]");
  if (!container) return [{ offsetPx: 0, clipHeightPx: contentHPx }];
  const blocks = collectBlocks(container);
  if (blocks.length === 0) return [{ offsetPx: 0, clipHeightPx: contentHPx }];
  const containerTop = container.getBoundingClientRect().top;
  const startsPx = blocks.map(
    (b) => b.getBoundingClientRect().top - containerTop,
  );
  const endsPx = blocks.map(
    (b) => b.getBoundingClientRect().bottom - containerTop,
  );

  const offsets: number[] = [0];
  let groupStart = 0;
  for (let i = 0; i < blocks.length; i++) {
    const h = (endsPx[i] ?? 0) - (startsPx[i] ?? 0);
    const pageOrigin = offsets[offsets.length - 1] ?? 0;
    if ((endsPx[i] ?? 0) <= pageOrigin + contentHPx - 5) continue;
    if (h > contentHPx) {
      if (i > groupStart) offsets.push(startsPx[groupStart] ?? 0);
      let pos = (startsPx[i] ?? 0) + contentHPx;
      while (pos < (endsPx[i] ?? 0)) {
        offsets.push(pos);
        pos += contentHPx;
      }
      groupStart = i + 1;
    } else {
      offsets.push(startsPx[i] ?? 0);
      groupStart = i;
    }
  }
  return offsets.map((off, i) => {
    const nextOff = i + 1 < offsets.length ? (offsets[i + 1] ?? Infinity) : Infinity;
    return { offsetPx: off, clipHeightPx: Math.min(contentHPx, nextOff - off) };
  });
}

export default function ResumePreview({
  resume,
  sectionOrder,
}: {
  resume: Resume;
  sectionOrder: string[];
}) {
  const firstPageContentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<
    { offsetPx: number; clipHeightPx: number }[]
  >([{ offsetPx: 0, clipHeightPx: 940 }]);

  const hasContent =
    resume.basics.name || resume.basics.summary || resume.experience.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function measure() {
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled || !firstPageContentRef.current) return;
      setPages(computeOffsets(firstPageContentRef.current));
    }
    measure();
    return () => {
      cancelled = true;
    };
  }, [resume]);

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <p className="text-[1.25em] font-medium mb-2">Your resume is empty</p>
          <p className="text-[1em]">
            Start chatting in the right panel to build it.
          </p>
        </div>
      </div>
    );
  }

  const pagesNeeded = pages.length;
  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Screen pages */}
      {pages.map(({ offsetPx, clipHeightPx }, i) => (
        <div
          key={i}
          data-page-index={i}
          className="bg-white shadow-lg shadow-slate-300/50 dark:shadow-black/50 rounded-sm flex-shrink-0 relative"
          style={{
            width: "210mm",
            ...(pagesNeeded === 1 ? { minHeight: `${PAGE_MM_H}mm`, height: "auto" } : { height: `${PAGE_MM_H}mm` }),
            padding: `${PAD_V}mm ${PAD_H}mm`,
            boxSizing: "border-box",
          }}
        >
          {pagesNeeded > 1 && (
            <span className="absolute bottom-2 right-4 text-[0.667em] text-slate-400 z-10">
              {i + 1}/{pagesNeeded}
            </span>
          )}
          <div
            style={{
              width: `${CONTENT_W_MM}mm`,
              ...(pagesNeeded === 1 ? {} : { height: `${clipHeightPx}px`, overflow: "clip", overflowClipMargin: "4px" }),
              position: "relative",
            }}
          >
            <div
              id={i === 0 ? "resume-preview" : undefined}
              ref={i === 0 ? firstPageContentRef : undefined}
              className="leading-relaxed text-slate-800"
              style={{
                width: `${CONTENT_W_MM}mm`,
                boxSizing: "border-box",
                fontFamily:
                  FONT_FAMILIES[resume.basics.font] || FONT_FAMILIES.lora,
                fontSize: `${resume.basics.fontSize || 12}px`,
                lineHeight: resume.basics.lineHeight || 1.5,
                transform: `translateY(-${offsetPx}px)`,
              }}
            >
              <ResumeContent resume={resume} sectionOrder={sectionOrder} />
            </div>
          </div>
        </div>
      ))}
      <div className="h-4 flex-shrink-0" />
    </div>
  );
}
