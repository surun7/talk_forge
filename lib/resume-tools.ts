import { tool } from "ai";
import { z } from "zod";
import type { Resume } from "./resume-schema";
import { nextId } from "./resume-schema";

type ResumeStore = { current: Resume };

// ---------- Basics ----------

const FONT_OPTIONS = ["lora","inter","merriweather","ibm-plex-serif","crimson-pro","eb-garamond","libre-baskerville","noto-serif","source-serif-4","fira-sans","work-sans","nunito","space-grotesk","noto-sans-sc","noto-serif-sc","zcool-xiaowei"] as const;
const COLOR_OPTIONS = ["indigo","blue","sky","teal","emerald","green","amber","orange","rose","pink","violet","slate"] as const;
const SECTION_KEYS = ["basics","overview","experience","education","skills","projects","certificates","publications","languages","honors","hobbies","volunteers","links"] as const;
const ICON_KEYS_FOR_TOOL = ["briefcase","graduation-cap","wrench","folder-git","award","book-open","languages","star","heart","heart-handshake","user","globe","file-text","link","camera","code","database","cloud","shield","zap","pen-tool","palette","music","rocket","target","trophy","sparkles","atom","brain","crown","gem","coffee","anchor","compass","flag"] as const;

export function makeUpdateBasics(store: ResumeStore) {
  return tool({
    description: "Update basics: name, title, email, phone, location, birth, summary, section labels, hidden sections, font, font size, accent color, section icons. Font/accentColor/sectionIcons must be chosen from available options — call listItems first to see current values.",
    inputSchema: z.object({
      name: z.string().optional(),
      title: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      birth: z.string().optional(),
      summary: z.string().optional(),
      sectionLabels: z.record(z.string(), z.string()).optional(),
      hiddenSections: z.array(z.string()).optional(),
      font: z.enum(FONT_OPTIONS).optional(),
      fontSize: z.number().int().min(8).max(18).optional(),
      accentColor: z.enum(COLOR_OPTIONS).optional(),
      sectionIcons: z.record(z.string(), z.string()).optional(),
    }),
    execute: async (args) => {
      if (args.name !== undefined) store.current.basics.name = args.name;
      if (args.title !== undefined) store.current.basics.title = args.title;
      if (args.email !== undefined) store.current.basics.email = args.email;
      if (args.phone !== undefined) store.current.basics.phone = args.phone;
      if (args.location !== undefined) store.current.basics.location = args.location;
      if (args.birth !== undefined) store.current.basics.birth = args.birth;
      if (args.summary !== undefined) store.current.basics.summary = args.summary;
      if (args.sectionLabels !== undefined) store.current.basics.sectionLabels = args.sectionLabels;
      if (args.hiddenSections !== undefined) store.current.basics.hiddenSections = args.hiddenSections;
      if (args.font !== undefined) store.current.basics.font = args.font;
      if (args.fontSize !== undefined) store.current.basics.fontSize = args.fontSize;
      if (args.accentColor !== undefined) store.current.basics.accentColor = args.accentColor;
      if (args.sectionIcons !== undefined) {
        const validKeys = SECTION_KEYS as readonly string[];
        const validIcons = ICON_KEYS_FOR_TOOL as readonly string[];
        const filtered: Record<string, string> = {};
        for (const [k, v] of Object.entries(args.sectionIcons)) {
          if (validKeys.includes(k) && validIcons.includes(v)) filtered[k] = v;
        }
        store.current.basics.sectionIcons = { ...store.current.basics.sectionIcons, ...filtered };
      }
      return "Basics updated.";
    },
  });
}

export function makeUpdatePhoto(store: ResumeStore) {
  return tool({
    description: "Set the profile photo URL. Use an empty string to remove.",
    inputSchema: z.object({
      url: z.string(),
    }),
    execute: async (args) => {
      store.current.basics.photo = args.url;
      return args.url ? "Photo updated." : "Photo removed.";
    },
  });
}

export function makeAddLink(store: ResumeStore) {
  return tool({
    description: "Add a link (LinkedIn, GitHub, portfolio, etc.) to the basics section.",
    inputSchema: z.object({
      label: z.string(),
      url: z.string().url(),
    }),
    execute: async (args) => {
      store.current.basics.links.push({ label: args.label, url: args.url });
      return `Link "${args.label}" added.`;
    },
  });
}

export function makeRemoveLink(store: ResumeStore) {
  return tool({
    description: "Remove a link from the basics section by its label.",
    inputSchema: z.object({
      label: z.string(),
    }),
    execute: async (args) => {
      store.current.basics.links = store.current.basics.links.filter(
        (l) => l.label !== args.label
      );
      return `Link "${args.label}" removed.`;
    },
  });
}

// ---------- Experience ----------

export function makeAddExperience(store: ResumeStore) {
  return tool({
    description: "Add a work experience entry.",
    inputSchema: z.object({
      company: z.string(),
      position: z.string(),
      city: z.string().optional(),
      url: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      store.current.experience.push({
        id: nextId(),
        company: args.company,
        position: args.position,
        city: args.city ?? "",
        url: args.url ?? "",
        startDate: args.startDate,
        endDate: args.endDate ?? "",
        description: args.description ?? "",
        highlights: args.highlights ?? [],
      });
      return `Experience at ${args.company} added.`;
    },
  });
}

export function makeUpdateExperience(store: ResumeStore) {
  return tool({
    description: "Update an existing experience entry by its ID.",
    inputSchema: z.object({
      id: z.string(),
      company: z.string().optional(),
      position: z.string().optional(),
      city: z.string().optional(),
      url: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.experience.find((e) => e.id === id);
      if (!item) return `Experience entry ${id} not found.`;
      Object.assign(item, rest);
      return "Experience updated.";
    },
  });
}

export function makeDeleteExperience(store: ResumeStore) {
  return tool({
    description: "Delete an experience entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.experience = store.current.experience.filter((e) => e.id !== args.id);
      return "Experience entry deleted.";
    },
  });
}

// ---------- Education ----------

export function makeAddEducation(store: ResumeStore) {
  return tool({
    description: "Add an education entry.",
    inputSchema: z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      store.current.education.push({
        id: nextId(),
        school: args.school,
        degree: args.degree,
        field: args.field,
        startDate: args.startDate,
        endDate: args.endDate ?? "",
        description: args.description ?? "",
      });
      return `Education at ${args.school} added.`;
    },
  });
}

export function makeUpdateEducation(store: ResumeStore) {
  return tool({
    description: "Update an existing education entry by its ID.",
    inputSchema: z.object({
      id: z.string(),
      school: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.education.find((e) => e.id === id);
      if (!item) return `Education entry ${id} not found.`;
      Object.assign(item, rest);
      return "Education updated.";
    },
  });
}

export function makeDeleteEducation(store: ResumeStore) {
  return tool({
    description: "Delete an education entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.education = store.current.education.filter((e) => e.id !== args.id);
      return "Education entry deleted.";
    },
  });
}

// ---------- Skills ----------

export function makeAddSkillCategory(store: ResumeStore) {
  return tool({
    description: "Add a skill category with optional initial skills.",
    inputSchema: z.object({
      name: z.string(),
      skills: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      store.current.skills.push({
        id: nextId(),
        name: args.name,
        skills: (args.skills || []).map((n) => ({ id: nextId(), name: n })),
      });
      return `Skill category "${args.name}" added.`;
    },
  });
}

export function makeDeleteSkillCategory(store: ResumeStore) {
  return tool({
    description: "Delete a skill category by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.skills = store.current.skills.filter((c) => c.id !== args.id);
      return "Skill category deleted.";
    },
  });
}

export function makeAddSkillToCategory(store: ResumeStore) {
  return tool({
    description: "Add a skill to an existing category by category ID.",
    inputSchema: z.object({
      categoryId: z.string(),
      name: z.string(),
    }),
    execute: async (args) => {
      const cat = store.current.skills.find((c) => c.id === args.categoryId);
      if (!cat) return `Category ${args.categoryId} not found.`;
      cat.skills.push({ id: nextId(), name: args.name });
      return `Skill "${args.name}" added to "${cat.name}".`;
    },
  });
}

export function makeDeleteSkillFromCategory(store: ResumeStore) {
  return tool({
    description: "Delete a skill from a category by skill ID.",
    inputSchema: z.object({ skillId: z.string() }),
    execute: async (args) => {
      for (const cat of store.current.skills) {
        cat.skills = cat.skills.filter((s) => s.id !== args.skillId);
      }
      return "Skill deleted.";
    },
  });
}

// ---------- Projects ----------

export function makeAddProject(store: ResumeStore) {
  return tool({
    description: "Add a project entry.",
    inputSchema: z.object({
      name: z.string(),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string(),
      url: z.string().url().or(z.literal("")).optional(),
      technologies: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      store.current.projects.push({
        id: nextId(),
        name: args.name,
        role: args.role ?? "",
        startDate: args.startDate ?? "",
        endDate: args.endDate ?? "",
        description: args.description,
        url: args.url ?? "",
        technologies: args.technologies ?? [],
      });
      return `Project "${args.name}" added.`;
    },
  });
}

export function makeUpdateProject(store: ResumeStore) {
  return tool({
    description: "Update an existing project by its ID.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      url: z.string().url().or(z.literal("")).optional(),
      technologies: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.projects.find((p) => p.id === id);
      if (!item) return `Project ${id} not found.`;
      Object.assign(item, rest);
      return "Project updated.";
    },
  });
}

export function makeDeleteProject(store: ResumeStore) {
  return tool({
    description: "Delete a project entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.projects = store.current.projects.filter((p) => p.id !== args.id);
      return "Project deleted.";
    },
  });
}

// ---------- Certificates ----------

export function makeAddCertificate(store: ResumeStore) {
  return tool({
    description: "Add a certificate or certification entry.",
    inputSchema: z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      url: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      store.current.certificates.push({
        id: nextId(),
        name: args.name,
        issuer: args.issuer,
        date: args.date,
        url: args.url ?? "",
        description: args.description ?? "",
      });
      return `Certificate "${args.name}" added.`;
    },
  });
}

export function makeUpdateCertificate(store: ResumeStore) {
  return tool({
    description: "Update an existing certificate by its ID.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      issuer: z.string().optional(),
      date: z.string().optional(),
      url: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.certificates.find((c) => c.id === id);
      if (!item) return `Certificate ${id} not found.`;
      Object.assign(item, rest);
      return "Certificate updated.";
    },
  });
}

export function makeDeleteCertificate(store: ResumeStore) {
  return tool({
    description: "Delete a certificate entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.certificates = store.current.certificates.filter((c) => c.id !== args.id);
      return "Certificate deleted.";
    },
  });
}

// ---------- Publications ----------

export function makeAddPublication(store: ResumeStore) {
  return tool({
    description: "Add a publication entry.",
    inputSchema: z.object({
      title: z.string(),
      publisher: z.string(),
      date: z.string(),
      url: z.string().url().or(z.literal("")).optional(),
    }),
    execute: async (args) => {
      store.current.publications.push({
        id: nextId(),
        title: args.title,
        author: "",
        publisher: args.publisher,
        date: args.date,
        url: args.url ?? "",
      });
      return `Publication "${args.title}" added.`;
    },
  });
}

export function makeUpdatePublication(store: ResumeStore) {
  return tool({
    description: "Update an existing publication by its ID.",
    inputSchema: z.object({
      id: z.string(),
      title: z.string().optional(),
      publisher: z.string().optional(),
      date: z.string().optional(),
      url: z.string().url().or(z.literal("")).optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.publications.find((p) => p.id === id);
      if (!item) return `Publication ${id} not found.`;
      Object.assign(item, rest);
      return "Publication updated.";
    },
  });
}

export function makeDeletePublication(store: ResumeStore) {
  return tool({
    description: "Delete a publication entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.publications = store.current.publications.filter((p) => p.id !== args.id);
      return "Publication deleted.";
    },
  });
}

// ---------- Honors ----------

export function makeAddHonor(store: ResumeStore) {
  return tool({
    description: "Add an honor/award entry.",
    inputSchema: z.object({
      name: z.string(), issuer: z.string(), date: z.string(), description: z.string().optional(),
    }),
    execute: async (args) => {
      store.current.honors.push({ id: nextId(), name: args.name, issuer: args.issuer, date: args.date, description: args.description ?? "" });
      return `Honor "${args.name}" added.`;
    },
  });
}

export function makeUpdateHonor(store: ResumeStore) {
  return tool({
    description: "Update an existing honor/award entry by its ID.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      issuer: z.string().optional(),
      date: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.honors.find((h) => h.id === id);
      if (!item) return `Honor ${id} not found.`;
      Object.assign(item, rest);
      return "Honor updated.";
    },
  });
}

export function makeDeleteHonor(store: ResumeStore) {
  return tool({
    description: "Delete an honor entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.honors = store.current.honors.filter((h) => h.id !== args.id);
      return "Honor deleted.";
    },
  });
}

// ---------- Hobbies ----------

export function makeAddHobby(store: ResumeStore) {
  return tool({
    description: "Add a hobby/interest entry.",
    inputSchema: z.object({ name: z.string() }),
    execute: async (args) => {
      store.current.hobbies.push({ id: nextId(), name: args.name });
      return `Hobby "${args.name}" added.`;
    },
  });
}

export function makeUpdateHobby(store: ResumeStore) {
  return tool({
    description: "Update an existing hobby/interest entry by its ID.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.hobbies.find((h) => h.id === id);
      if (!item) return `Hobby ${id} not found.`;
      Object.assign(item, rest);
      return "Hobby updated.";
    },
  });
}

export function makeDeleteHobby(store: ResumeStore) {
  return tool({
    description: "Delete a hobby by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.hobbies = store.current.hobbies.filter((h) => h.id !== args.id);
      return "Hobby deleted.";
    },
  });
}

// ---------- Volunteership ----------

export function makeAddVolunteer(store: ResumeStore) {
  return tool({
    description: "Add a volunteer experience entry.",
    inputSchema: z.object({
      organization: z.string(), role: z.string(), startDate: z.string(),
      endDate: z.string().optional(), description: z.string().optional(),
    }),
    execute: async (args) => {
      store.current.volunteers.push({ id: nextId(), organization: args.organization, role: args.role, startDate: args.startDate, endDate: args.endDate ?? "", description: args.description ?? "" });
      return `Volunteer at ${args.organization} added.`;
    },
  });
}

export function makeUpdateVolunteer(store: ResumeStore) {
  return tool({
    description: "Update an existing volunteer entry by its ID.",
    inputSchema: z.object({
      id: z.string(),
      organization: z.string().optional(),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.volunteers.find((v) => v.id === id);
      if (!item) return `Volunteer ${id} not found.`;
      Object.assign(item, rest);
      return "Volunteer updated.";
    },
  });
}

export function makeDeleteVolunteer(store: ResumeStore) {
  return tool({
    description: "Delete a volunteer entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.volunteers = store.current.volunteers.filter((v) => v.id !== args.id);
      return "Volunteer entry deleted.";
    },
  });
}

// ---------- Custom Sections ----------

export function makeAddCustomSection(store: ResumeStore) {
  return tool({
    description: "Add a custom section to the resume.",
    inputSchema: z.object({
      title: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      store.current.customSections.push({
        id: nextId(),
        title: args.title,
        icon: args.icon ?? "star",
        description: args.description ?? "",
        items: [],
      });
      return `Custom section "${args.title}" added.`;
    },
  });
}

export function makeUpdateCustomSection(store: ResumeStore) {
  return tool({
    description: "Update an existing custom section by its ID.",
    inputSchema: z.object({
      id: z.string(),
      title: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.customSections.find((s) => s.id === id);
      if (!item) return `Custom section ${id} not found.`;
      Object.assign(item, rest);
      return "Custom section updated.";
    },
  });
}

export function makeDeleteCustomSection(store: ResumeStore) {
  return tool({
    description: "Delete a custom section by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.customSections = store.current.customSections.filter((s) => s.id !== args.id);
      return "Custom section deleted.";
    },
  });
}

export function makeAddCustomSectionItem(store: ResumeStore) {
  return tool({
    description: "Add an item to a custom section by section ID.",
    inputSchema: z.object({
      sectionId: z.string(),
      text: z.string(),
    }),
    execute: async (args) => {
      const section = store.current.customSections.find((s) => s.id === args.sectionId);
      if (!section) return `Custom section ${args.sectionId} not found.`;
      section.items.push({ id: nextId(), text: args.text });
      return `Item added to "${section.title}".`;
    },
  });
}

export function makeUpdateCustomSectionItem(store: ResumeStore) {
  return tool({
    description: "Update an item in a custom section by item ID.",
    inputSchema: z.object({
      itemId: z.string(),
      text: z.string().optional(),
    }),
    execute: async (args) => {
      for (const section of store.current.customSections) {
        const item = section.items.find((i) => i.id === args.itemId);
        if (item) {
          if (args.text !== undefined) item.text = args.text;
          return `Item updated in "${section.title}".`;
        }
      }
      return `Item ${args.itemId} not found.`;
    },
  });
}

export function makeDeleteCustomSectionItem(store: ResumeStore) {
  return tool({
    description: "Delete an item from a custom section by item ID.",
    inputSchema: z.object({ itemId: z.string() }),
    execute: async (args) => {
      for (const section of store.current.customSections) {
        const idx = section.items.findIndex((i) => i.id === args.itemId);
        if (idx !== -1) {
          section.items.splice(idx, 1);
          return `Item deleted from "${section.title}".`;
        }
      }
      return `Item ${args.itemId} not found.`;
    },
  });
}

// ---------- Languages ----------

export function makeAddLanguage(store: ResumeStore) {
  return tool({
    description: "Add a language entry.",
    inputSchema: z.object({
      name: z.string(),
      level: z.string(),
    }),
    execute: async (args) => {
      store.current.languages.push({ id: nextId(), name: args.name, level: args.level });
      return `Language "${args.name}" added.`;
    },
  });
}

export function makeUpdateLanguage(store: ResumeStore) {
  return tool({
    description: "Update an existing language by its ID.",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      level: z.string().optional(),
    }),
    execute: async (args) => {
      const { id, ...rest } = args;
      const item = store.current.languages.find((l) => l.id === id);
      if (!item) return `Language ${id} not found.`;
      Object.assign(item, rest);
      return "Language updated.";
    },
  });
}

export function makeDeleteLanguage(store: ResumeStore) {
  return tool({
    description: "Delete a language entry by its ID.",
    inputSchema: z.object({ id: z.string() }),
    execute: async (args) => {
      store.current.languages = store.current.languages.filter((l) => l.id !== args.id);
      return "Language deleted.";
    },
  });
}

// ---------- List ----------

export function makeListItems(store: ResumeStore) {
  return tool({
    description: "List all current items in the resume (IDs and key details). Use this to find IDs before updating or deleting.",
    inputSchema: z.object({}),
    execute: async () => {
      const sections = {
        basics: store.current.basics,
        experience: store.current.experience.map((e) => ({
          id: e.id, company: e.company, position: e.position,
        })),
        education: store.current.education.map((e) => ({
          id: e.id, school: e.school, degree: e.degree,
        })),
        skills: store.current.skills.map((c) => ({
          id: c.id, name: c.name, skills: c.skills.map((s) => ({ id: s.id, name: s.name })),
        })),
        projects: store.current.projects.map((p) => ({
          id: p.id, name: p.name,
        })),
        certificates: store.current.certificates.map((c) => ({
          id: c.id, name: c.name, issuer: c.issuer,
        })),
        publications: store.current.publications.map((p) => ({
          id: p.id, title: p.title, publisher: p.publisher,
        })),
        languages: store.current.languages.map((l) => ({
          id: l.id, name: l.name, level: l.level,
        })),
        honors: store.current.honors.map((h) => ({
          id: h.id, name: h.name, issuer: h.issuer,
        })),
        hobbies: store.current.hobbies.map((h) => ({
          id: h.id, name: h.name,
        })),
        volunteers: store.current.volunteers.map((v) => ({
          id: v.id, organization: v.organization, role: v.role,
        })),
        customSections: store.current.customSections.map((s) => ({
          id: s.id, title: s.title, items: s.items.map((i) => ({ id: i.id, text: i.text })),
        })),
      };
      return JSON.stringify(sections, null, 2);
    },
  });
}

// ---------- Build all ----------

export function buildAllTools(store: ResumeStore) {
  return {
    updateBasics: makeUpdateBasics(store),
    updatePhoto: makeUpdatePhoto(store),
    addLink: makeAddLink(store),
    removeLink: makeRemoveLink(store),
    addExperience: makeAddExperience(store),
    updateExperience: makeUpdateExperience(store),
    deleteExperience: makeDeleteExperience(store),
    addEducation: makeAddEducation(store),
    updateEducation: makeUpdateEducation(store),
    deleteEducation: makeDeleteEducation(store),
    addSkillCategory: makeAddSkillCategory(store),
    deleteSkillCategory: makeDeleteSkillCategory(store),
    addSkillToCategory: makeAddSkillToCategory(store),
    deleteSkillFromCategory: makeDeleteSkillFromCategory(store),
    addProject: makeAddProject(store),
    updateProject: makeUpdateProject(store),
    deleteProject: makeDeleteProject(store),
    addCertificate: makeAddCertificate(store),
    updateCertificate: makeUpdateCertificate(store),
    deleteCertificate: makeDeleteCertificate(store),
    addPublication: makeAddPublication(store),
    updatePublication: makeUpdatePublication(store),
    deletePublication: makeDeletePublication(store),
    addLanguage: makeAddLanguage(store),
    updateLanguage: makeUpdateLanguage(store),
    deleteLanguage: makeDeleteLanguage(store),
    addHonor: makeAddHonor(store),
    updateHonor: makeUpdateHonor(store),
    deleteHonor: makeDeleteHonor(store),
    addHobby: makeAddHobby(store),
    updateHobby: makeUpdateHobby(store),
    deleteHobby: makeDeleteHobby(store),
    addVolunteer: makeAddVolunteer(store),
    updateVolunteer: makeUpdateVolunteer(store),
    deleteVolunteer: makeDeleteVolunteer(store),
    addCustomSection: makeAddCustomSection(store),
    updateCustomSection: makeUpdateCustomSection(store),
    deleteCustomSection: makeDeleteCustomSection(store),
    addCustomSectionItem: makeAddCustomSectionItem(store),
    updateCustomSectionItem: makeUpdateCustomSectionItem(store),
    deleteCustomSectionItem: makeDeleteCustomSectionItem(store),
    listItems: makeListItems(store),
  };
}
