import { z } from "zod";

export const linkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

export const basicsSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  birth: z.string(),
  wechat: z.string().default(""),
  photo: z.string(),
  font: z.string(),
  fontSize: z.number(),
  lineHeight: z.number().default(1.5),
  accentColor: z.string(),
  sectionLabels: z.record(z.string(), z.string()),
  sectionIcons: z.record(z.string(), z.string()),
  hiddenSections: z.array(z.string()),
  summary: z.string(),
  links: z.array(linkSchema),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  city: z.string(),
  url: z.string().url().or(z.literal("")),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
});

export const educationItemSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(skillItemSchema),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().default(""),
  affiliation: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
  url: z.string().url().or(z.literal("")).default(""),
  technologies: z.array(z.string()).default([]),
}).passthrough();

export const certificateItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  longTerm: z.boolean().default(false),
  url: z.string().url().or(z.literal("")).default(""),
  description: z.string().default(""),
}).passthrough();

export const publicationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional().default(""),
  publisher: z.string(),
  date: z.string(),
  url: z.string().url().or(z.literal("")),
  description: z.string().optional().default(""),
});

export const languageItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
});

export const honorItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
});

export const hobbyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const volunteerItemSchema = z.object({
  id: z.string(),
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const customItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  role: z.string().default(""),
  affiliation: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
}).passthrough(); // accepts old {text} or {time} fields for backward compatibility

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  items: z.array(customItemSchema),
});

export const resumeSchema = z.object({
  basics: basicsSchema,
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skills: z.array(skillCategorySchema),
  projects: z.array(projectItemSchema),
  certificates: z.array(certificateItemSchema),
  publications: z.array(publicationItemSchema),
  languages: z.array(languageItemSchema),
  honors: z.array(honorItemSchema),
  hobbies: z.array(hobbyItemSchema),
  volunteers: z.array(volunteerItemSchema),
  customSections: z.array(customSectionSchema),
});

export type Link = z.infer<typeof linkSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type CertificateItem = z.infer<typeof certificateItemSchema>;
export type PublicationItem = z.infer<typeof publicationItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type HonorItem = z.infer<typeof honorItemSchema>;
export type HobbyItem = z.infer<typeof hobbyItemSchema>;
export type VolunteerItem = z.infer<typeof volunteerItemSchema>;
export type CustomItem = z.infer<typeof customItemSchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type Resume = z.infer<typeof resumeSchema>;

let counter = 0;
function nextId(): string {
  counter++;
  return `item_${Date.now()}_${counter}`;
}

export function createDefaultResume(): Resume {
  return {
    basics: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      birth: "",
      wechat: "",
      photo: "",
      font: "lora",
      fontSize: 12,
      lineHeight: 1.5,
      accentColor: "indigo",
      sectionLabels: {},
      sectionIcons: {},
      hiddenSections: [],
      summary: "",
      links: [],
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    publications: [],
    languages: [],
    honors: [],
    hobbies: [],
    volunteers: [],
    customSections: [],
  };
}

export function createTemplateResume(): Resume {
  return {
    basics: {
      name: "Your Name",
      title: "Senior Software Engineer",
      email: "email@example.com",
      phone: "+1 (555) 123-4567",
      location: "City, Country",
      birth: "1990-06",
      wechat: "",
      photo: "",
      font: "lora",
      fontSize: 12,
      lineHeight: 1.5,
      accentColor: "indigo",
      sectionLabels: {},
      sectionIcons: {},
      hiddenSections: [],
      summary: "Brief professional summary highlighting your background, strengths, and career goals.",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/yourprofile" },
        { label: "GitHub", url: "https://github.com/yourusername" },
      ],
    },
    experience: [
      {
        id: "tpl_exp_1",
        company: "Company Name",
        position: "Job Title",
        city: "City, Country",
        url: "",
        startDate: "2020-01",
        endDate: "2023-12",
        description: "Describe your role and key responsibilities here.",
        highlights: ["Key achievement or contribution"],
      },


    ],
    education: [
      {
        id: "tpl_edu_1",
        school: "University Name",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2013-09",
        endDate: "2017-06",
        description: "",
      },
    ],
    skills: [
      { id: "tpl_cat_1", name: "Programming Languages", skills: [
        { id: "tpl_skill_1", name: "JavaScript" },
        { id: "tpl_skill_2", name: "Python" },
      ]},
      { id: "tpl_cat_2", name: "Frameworks", skills: [
        { id: "tpl_skill_3", name: "React" },
      ]},
    ],
    projects: [
      {
        id: "tpl_proj_1",
        name: "Project Name",
        role: "Developer",
        affiliation: "",
        startDate: "2022-01",
        endDate: "2022-06",
        description: "Brief description of the project, its purpose, and your role.",
        url: "https://github.com/yourusername/project",
        technologies: ["React", "Node.js", "PostgreSQL"],
      },
    ],
    certificates: [
      {
        id: "tpl_cert_1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        startDate: "2023-03",
        endDate: "",
        longTerm: true,
        url: "",
        description: "",
      },
    ],
    publications: [
      {
        id: "tpl_pub_1",
        title: "Sample Publication Title",
        author: "",
        publisher: "Journal Name",
        date: "2022-08",
        url: "",
        description: "",
      },
    ],
    languages: [
      { id: "tpl_lang_1", name: "English", level: "Fluent" },
      { id: "tpl_lang_2", name: "Mandarin", level: "Native" },
    ],
    honors: [
      {
        id: "tpl_honor_1",
        name: "Best Paper Award",
        issuer: "Conference Name",
        date: "2021-06",
        description: "",
      },
    ],
    hobbies: [
      { id: "tpl_hobby_1", name: "Open Source" },
      { id: "tpl_hobby_2", name: "Photography" },
    ],
    volunteers: [
      {
        id: "tpl_vol_1",
        organization: "Nonprofit Organization",
        role: "Volunteer Developer",
        startDate: "2021-01",
        endDate: "2022-12",
        description: "",
      },
    ],
    customSections: [],
  };
}

export function createChineseTemplateResume(): Resume {
  return {
    basics: {
      name: "你的姓名",
      title: "高级软件工程师",
      email: "email@example.com",
      phone: "+86 138-0000-0000",
      location: "城市, 国家",
      birth: "1990-06",
      wechat: "",
      photo: "",
      font: "noto-serif-sc",
      fontSize: 12,
      lineHeight: 1.5,
      accentColor: "indigo",
      sectionLabels: {},
      sectionIcons: {},
      hiddenSections: [],
      summary: "简要的职业简介，突出你的背景、优势和职业目标。",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/yourprofile" },
        { label: "GitHub", url: "https://github.com/yourusername" },
      ],
    },
    experience: [
      {
        id: "zh_tpl_exp_1",
        company: "公司名称",
        position: "职位",
        city: "城市, 国家",
        url: "",
        startDate: "2020-01",
        endDate: "2023-12",
        description: "在这里描述你的职责和主要工作内容。",
        highlights: ["关键成就或贡献"],
      },
    ],
    education: [
      {
        id: "zh_tpl_edu_1",
        school: "大学名称",
        degree: "学士",
        field: "计算机科学与技术",
        startDate: "2013-09",
        endDate: "2017-06",
        description: "",
      },
    ],
    skills: [
      { id: "zh_tpl_cat_1", name: "编程语言", skills: [
        { id: "zh_tpl_skill_1", name: "JavaScript" },
        { id: "zh_tpl_skill_2", name: "Python" },
      ]},
      { id: "zh_tpl_cat_2", name: "框架", skills: [
        { id: "zh_tpl_skill_3", name: "React" },
      ]},
    ],
    projects: [
      {
        id: "zh_tpl_proj_1",
        name: "项目名称",
        role: "开发者",
        affiliation: "",
        startDate: "2022-01",
        endDate: "2022-06",
        description: "简要描述项目内容、目标以及你的角色。",
        url: "https://github.com/yourusername/project",
        technologies: ["React", "Node.js", "PostgreSQL"],
      },
    ],
    certificates: [
      {
        id: "zh_tpl_cert_1",
        name: "AWS 认证解决方案架构师",
        issuer: "Amazon Web Services",
        startDate: "2023-03",
        endDate: "",
        longTerm: true,
        url: "",
        description: "",
      },
    ],
    publications: [
      {
        id: "zh_tpl_pub_1",
        title: "示例出版物标题",
        author: "",
        publisher: "期刊名称",
        date: "2022-08",
        url: "",
        description: "",
      },
    ],
    languages: [
      { id: "zh_tpl_lang_1", name: "中文", level: "母语" },
      { id: "zh_tpl_lang_2", name: "英语", level: "流利" },
    ],
    honors: [
      {
        id: "zh_tpl_honor_1",
        name: "最佳论文奖",
        issuer: "会议名称",
        date: "2021-06",
        description: "",
      },
    ],
    hobbies: [
      { id: "zh_tpl_hobby_1", name: "开源项目" },
      { id: "zh_tpl_hobby_2", name: "摄影" },
    ],
    volunteers: [
      {
        id: "zh_tpl_vol_1",
        organization: "非营利组织",
        role: "志愿开发者",
        startDate: "2021-01",
        endDate: "2022-12",
        description: "",
      },
    ],
    customSections: [],
  };
}

export { nextId };
