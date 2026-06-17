"use client";
import BasicsSection from "./sections/basics-section";
import OverviewSection from "./sections/overview-section";
import ExperienceSection from "./sections/experience-section";
import EducationSection from "./sections/education-section";
import SkillsSection from "./sections/skills-section";
import ProjectsSection from "./sections/projects-section";
import CertificatesSection from "./sections/certificates-section";
import PublicationsSection from "./sections/publications-section";
import LanguagesSection from "./sections/languages-section";
import HonorsSection from "./sections/honors-section";
import HobbiesSection from "./sections/hobbies-section";
import VolunteersSection from "./sections/volunteers-section";

export const sectionComponents: Record<string, React.FC<any>> = {
  basics: BasicsSection,
  overview: OverviewSection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  certificates: CertificatesSection,
  publications: PublicationsSection,
  languages: LanguagesSection,
  honors: HonorsSection,
  hobbies: HobbiesSection,
  volunteers: VolunteersSection,
};
