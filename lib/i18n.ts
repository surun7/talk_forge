export const translations: Record<string, Record<string, string>> = {
  en: {
    // Dashboard
    "dashboard.title": "Talk Forge",
    "dashboard.subtitle": "Dashboard",
    "dashboard.newResume": "New Resume",
    "dashboard.loading": "Loading...",
    "dashboard.emptyTitle": "No resumes yet",
    "dashboard.emptyDesc": "Create your first resume to get started",
    "dashboard.createResume": "Create Resume",
    "dashboard.untitled": "Untitled",
    "dashboard.lightMode": "Light mode",
    "dashboard.darkMode": "Dark mode",
    "dashboard.chinese": "中文",
    "dashboard.english": "English",
    "dashboard.deleteTitle": "Delete Resume",
    "dashboard.deleteDesc": "This action cannot be undone.",
    "dashboard.cancel": "Cancel",
    "dashboard.delete": "Delete",

    // Editor page
    "editor.loading": "Loading...",
    "editor.preview": "Preview",
    "editor.chat": "Chat",
    "editor.aiChat": "AI Chat",
    "editor.manual": "Manual",

    // Toolbar
    "toolbar.backToDashboard": "Back to Dashboard",
    "toolbar.agent": "Agent",
    "toolbar.manual": "Manual",
    "toolbar.downloadPDF": "Download PDF",
    "toolbar.downloading": "Downloading",
    "toolbar.undo": "Undo (Ctrl+Z)",
    "toolbar.redo": "Redo (Ctrl+Shift+Z)",

    // Dashboard sidebar
    "sidebar.dataManagement": "Data Management",
    "sidebar.exportBackup": "Download Backup",
    "sidebar.importBackup": "Import Resume Backup",
    "sidebar.apiSettings": "API Settings",
    "sidebar.help": "Help",
    "sidebar.exported": "Exported {count} project(s)",
    "sidebar.imported": "Imported {count} project(s)",
    "sidebar.exportFailed": "Export failed: {msg}",
    "sidebar.importFailed": "Import failed: {msg}",

    // API Settings panel
    "apiSettings.title": "API Settings",
    "apiSettings.selected": "Selected",
    "apiSettings.builtinProviders": "Built-in Providers",
    "apiSettings.apiKey": "API Key",
    "apiSettings.model": "Model",
    "apiSettings.customProviders": "Custom Providers",
    "apiSettings.add": "Add",
    "apiSettings.namePlaceholder": "Name (e.g. Kimi)",
    "apiSettings.modelPlaceholder": "Model",
    "apiSettings.storageNote": "API keys stored locally in your browser",
    "apiSettings.save": "Save",
    "apiSettings.saved": "Saved ✓",

    // Chat panel
    "chat.newConversation": "New Conversation",
    "chat.welcome": "Hi! I can help build your resume. Tell me about your experience, education, skills, or projects and I'll add them.",
    "chat.placeholder": "Tell me what to add or change...",
    "chat.thinking": "Thinking...",
    "chat.editingResume": "Editing resume...",
    "chat.updated": "Updated",
    "chat.conversations": "Conversations",
    "chat.new": "New",
    "chat.error": "Error: {msg}",
    "chat.resumeUpdated": "Resume updated.",
    "chat.noResponse": "No response received — check server logs.",
    "chat.save": "Save",
    "chat.rename": "Rename",
    "chat.uploadPhoto": "Upload photo",

    // Photo Upload modal
    "photo.uploadTitle": "Upload Photo",
    "photo.clickToSelect": "Click to select photo",
    "photo.changePhoto": "Change Photo",
    "photo.selectPhoto": "Select Photo",
    "photo.apply": "Apply",
    "photo.zoomHint": "Drag to reposition • Scroll or slider to zoom",

    // Manual editor (Add Section)
    "editor.addSection": "Add Section",

    // Section field labels
    "basics.uploadPhoto": "Upload Photo",
    "basics.changePhoto": "Change Photo",
    "basics.name": "Name",
    "basics.jobTitle": "Job Title",
    "basics.email": "Email",
    "basics.phone": "Phone",
    "basics.location": "Location",
    "basics.birth": "Birth",
    "basics.wechat": "WeChat",
    "basics.wechatPlaceholder": "WeChat ID",
    "basics.links": "Links",
    "basics.label": "Label",
    "basics.url": "URL",
    "basics.addLink": "Add",
    "basics.namePlaceholder": "Full name",
    "basics.jobTitlePlaceholder": "Job title",
    "basics.emailPlaceholder": "email@example.com",
    "basics.locationPlaceholder": "City, Country",
    "basics.birthPlaceholder": "e.g. 1990-06",

    // Experience section
    "experience.add": "Add Experience",
    "experience.newItem": "New Experience",
    "experience.company": "Company",
    "experience.position": "Position",
    "experience.city": "City",
    "experience.startDate": "Start Date",
    "experience.endDate": "End Date",
    "experience.url": "URL",
    "experience.description": "Description",
    "experience.highlights": "Highlights",
    "experience.addHighlight": "Add Highlight",
    "experience.highlightPlaceholder": "Key achievement...",
    "experience.endDatePlaceholder": "Present",

    // Education section
    "education.add": "Add Education",
    "education.newItem": "New Education",
    "education.school": "School",
    "education.degree": "Degree",
    "education.field": "Field",
    "education.startDate": "Start Date",
    "education.endDate": "End Date",
    "education.description": "Description",

    // Skills section
    "skills.add": "Add Skill Category",
    "skills.newItem": "New Skill Category",
    "skills.skills": "Skills",
    "skills.addSkill": "Add Skill",
    "skills.skillName": "Skill Name",
    "skills.categoryName": "Category Name",

    // Projects section
    "projects.add": "Add Project",
    "projects.newItem": "New Project",
    "projects.name": "Name",
    "projects.role": "Role",
    "projects.url": "URL",
    "projects.startDate": "Start Date",
    "projects.endDate": "End Date",
    "projects.description": "Description",
    "projects.technologies": "Technologies",
    "projects.addTech": "Add Tech",

    // Certificates section
    "certificates.add": "Add Certificate",
    "certificates.newItem": "New Certificate",
    "certificates.name": "Name",
    "certificates.issuer": "Issuer",
    "certificates.date": "Date",
    "certificates.url": "URL",
    "certificates.description": "Description",
    "certificates.longTerm": "Permanent",
    "certificates.present": "Present",

    // Publications section
    "publications.add": "Add Publication",
    "publications.newItem": "New Publication",
    "publications.title": "Title",
    "publications.author": "Author",
    "publications.publisher": "Publisher",
    "publications.date": "Date",
    "publications.url": "URL",

    // Languages section
    "languages.add": "Add Language",
    "languages.newItem": "New Language",
    "languages.language": "Language",
    "languages.level": "Level",

    // Honors section
    "honors.add": "Add Honor",
    "honors.newItem": "New Honor",
    "honors.name": "Name",
    "honors.issuer": "Issuer",
    "honors.date": "Date",
    "honors.description": "Description",

    // Hobbies section
    "hobbies.add": "Add Hobby",
    "hobbies.newItem": "New Hobby",
    "hobbies.name": "Name",

    // Volunteering section
    "volunteers.add": "Add Volunteer",
    "volunteers.newItem": "New Volunteer",
    "volunteers.organization": "Organization",
    "volunteers.role": "Role",
    "volunteers.startDate": "Start Date",
    "volunteers.endDate": "End Date",
    "volunteers.description": "Description",

    // Overview section
    "overview.summary": "Summary",
  },

  zh: {
    // Dashboard
    "dashboard.title": "语造",
    "dashboard.subtitle": "控制台",
    "dashboard.newResume": "新建简历",
    "dashboard.loading": "加载中...",
    "dashboard.emptyTitle": "暂无简历",
    "dashboard.emptyDesc": "创建你的第一份简历",
    "dashboard.createResume": "创建简历",
    "dashboard.untitled": "未命名",
    "dashboard.lightMode": "浅色模式",
    "dashboard.darkMode": "深色模式",
    "dashboard.chinese": "中文",
    "dashboard.english": "English",
    "dashboard.deleteTitle": "删除简历",
    "dashboard.deleteDesc": "此操作不可撤销。",
    "dashboard.cancel": "取消",
    "dashboard.delete": "删除",

    // Editor page
    "editor.loading": "加载中...",
    "editor.preview": "预览",
    "editor.chat": "聊天",
    "editor.aiChat": "AI 聊天",
    "editor.manual": "手动编辑",

    // Toolbar
    "toolbar.backToDashboard": "返回控制台",
    "toolbar.agent": "智能助手",
    "toolbar.manual": "手动编辑",
    "toolbar.downloadPDF": "下载 PDF",
    "toolbar.downloading": "下载中",
    "toolbar.undo": "撤销 (Ctrl+Z)",
    "toolbar.redo": "重做 (Ctrl+Shift+Z)",

    // Dashboard sidebar
    "sidebar.dataManagement": "数据管理",
    "sidebar.exportBackup": "下载备份",
    "sidebar.importBackup": "导入简历备份",
    "sidebar.apiSettings": "API 设置",
    "sidebar.help": "帮助",
    "sidebar.exported": "成功导出 {count} 个项目",
    "sidebar.imported": "成功导入 {count} 个项目",
    "sidebar.exportFailed": "导出失败：{msg}",
    "sidebar.importFailed": "导入失败：{msg}",

    // API Settings panel
    "apiSettings.title": "API 设置",
    "apiSettings.selected": "已选择",
    "apiSettings.builtinProviders": "内置提供商",
    "apiSettings.apiKey": "API Key",
    "apiSettings.model": "模型名",
    "apiSettings.customProviders": "自定义提供商",
    "apiSettings.add": "添加",
    "apiSettings.namePlaceholder": "名称 (如 Kimi)",
    "apiSettings.modelPlaceholder": "模型名",
    "apiSettings.storageNote": "API 密钥仅存储在浏览器本地",
    "apiSettings.save": "保存",
    "apiSettings.saved": "已保存 ✓",

    // Chat panel
    "chat.newConversation": "新对话",
    "chat.welcome": "你好！我可以帮你制作简历。告诉我你的经历、教育、技能或项目，我会帮你添加。",
    "chat.placeholder": "告诉我你想添加或修改的内容……",
    "chat.thinking": "思考中…",
    "chat.editingResume": "正在编辑简历…",
    "chat.updated": "已更新",
    "chat.conversations": "对话列表",
    "chat.new": "新建",
    "chat.error": "错误：{msg}",
    "chat.resumeUpdated": "简历已更新。",
    "chat.noResponse": "未收到回复——请检查服务器日志。",
    "chat.save": "保存",
    "chat.rename": "重命名",
    "chat.uploadPhoto": "上传照片",

    // Photo Upload modal
    "photo.uploadTitle": "上传照片",
    "photo.clickToSelect": "点击选择照片",
    "photo.changePhoto": "更换照片",
    "photo.selectPhoto": "选择照片",
    "photo.apply": "应用",
    "photo.zoomHint": "拖动调整位置 · 滚轮或滑块缩放",

    // Manual editor (Add Section)
    "editor.addSection": "添加模块",

    // Section field labels
    "basics.uploadPhoto": "上传照片",
    "basics.changePhoto": "更换照片",
    "basics.name": "姓名",
    "basics.jobTitle": "职位",
    "basics.email": "邮箱",
    "basics.phone": "电话",
    "basics.location": "所在地",
    "basics.birth": "出生年月",
    "basics.wechat": "微信",
    "basics.wechatPlaceholder": "微信号",
    "basics.links": "社交链接",
    "basics.label": "标签",
    "basics.url": "链接",
    "basics.addLink": "添加",
    "basics.namePlaceholder": "全名",
    "basics.jobTitlePlaceholder": "职位",
    "basics.emailPlaceholder": "email@example.com",
    "basics.locationPlaceholder": "城市, 国家",
    "basics.birthPlaceholder": "例如 1990-06",

    // Experience section
    "experience.add": "添加经历",
    "experience.newItem": "新经历",
    "experience.company": "公司",
    "experience.position": "职位",
    "experience.city": "城市",
    "experience.startDate": "开始日期",
    "experience.endDate": "结束日期",
    "experience.url": "链接",
    "experience.description": "描述",
    "experience.highlights": "亮点",
    "experience.addHighlight": "添加亮点",
    "experience.highlightPlaceholder": "关键成就……",
    "experience.endDatePlaceholder": "至今",

    // Education section
    "education.add": "添加教育",
    "education.newItem": "新教育经历",
    "education.school": "学校",
    "education.degree": "学位",
    "education.field": "专业",
    "education.startDate": "开始日期",
    "education.endDate": "结束日期",
    "education.description": "描述",

    // Skills section
    "skills.add": "添加技能分类",
    "skills.newItem": "新技能分类",
    "skills.skills": "技能",
    "skills.addSkill": "添加技能",
    "skills.skillName": "技能名称",
    "skills.categoryName": "分类名称",

    // Projects section
    "projects.add": "添加项目",
    "projects.newItem": "新项目",
    "projects.name": "名称",
    "projects.role": "角色",
    "projects.url": "链接",
    "projects.startDate": "开始日期",
    "projects.endDate": "结束日期",
    "projects.description": "描述",
    "projects.technologies": "技术栈",
    "projects.addTech": "添加技术",

    // Certificates section
    "certificates.add": "添加证书",
    "certificates.newItem": "新证书",
    "certificates.name": "名称",
    "certificates.issuer": "颁发机构",
    "certificates.date": "日期",
    "certificates.url": "链接",
    "certificates.description": "描述",
    "certificates.longTerm": "长期有效",
    "certificates.present": "至今",

    // Publications section
    "publications.add": "添加出版物",
    "publications.newItem": "新出版物",
    "publications.title": "标题",
    "publications.author": "作者",
    "publications.publisher": "出版商",
    "publications.date": "日期",
    "publications.url": "链接",

    // Languages section
    "languages.add": "添加语言",
    "languages.newItem": "新语言",
    "languages.language": "语言",
    "languages.level": "水平",

    // Honors section
    "honors.add": "添加荣誉",
    "honors.newItem": "新荣誉",
    "honors.name": "名称",
    "honors.issuer": "颁发机构",
    "honors.date": "日期",
    "honors.description": "描述",

    // Hobbies section
    "hobbies.add": "添加爱好",
    "hobbies.newItem": "新爱好",
    "hobbies.name": "名称",

    // Volunteering section
    "volunteers.add": "添加志愿经历",
    "volunteers.newItem": "新志愿经历",
    "volunteers.organization": "组织",
    "volunteers.role": "角色",
    "volunteers.startDate": "开始日期",
    "volunteers.endDate": "结束日期",
    "volunteers.description": "描述",

    // Overview section
    "overview.summary": "个人简介",
  },
};

export function t(locale: "en" | "zh", key: string, replacements?: Record<string, string>): string {
  const dict = translations[locale] ?? translations.en!;
  let val = dict![key];
  if (!val) {
    // Fallback to English
    val = translations.en![key] ?? key;
  }
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{${k}}`, v);
    }
  }
  return val;
}
