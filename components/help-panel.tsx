"use client";

import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale-provider";

interface QA {
  q: string;
  a: string;
}

const EN_QA: QA[] = [
  {
    q: "How to use Talk Forge?",
    a: "Talk Forge is an AI-powered resume builder. Create a new resume from the dashboard, then use AI Chat mode (describe what you want and the AI builds it) or the Manual Editor (fill in fields directly). Switch modes using the toggle in the editor toolbar. Data is saved automatically in your browser's localStorage."
  },
  {
    q: "How to add an API key for chat mode?",
    a: "Click 'API Settings' in the sidebar, select a provider (e.g. OpenAI, DeepSeek, Kimi) and enter your API key. You can also add custom providers under Custom Providers. Keys are stored in your browser's localStorage and are never sent to our server."
  },
  {
    q: "What is export/import JSON resume?",
    a: "Export creates a downloadable .json backup file containing all your resumes. Use it to save your work or transfer data between browsers. Import reads a previously exported .json file and restores all resumes. Both single-project files and bundled backup files are supported."
  },
  {
    q: "How to switch language?",
    a: "Click the globe icon in the top-right corner of the dashboard to toggle between English and Chinese. Your preference is saved in the browser and persists across sessions."
  },
  {
    q: "Where is my data stored? Is it safe?",
    a: "All your data (resumes, conversations, settings) is stored exclusively in your browser's localStorage. We have no cloud server, database, or backend that stores any of your personal information. Your data never leaves your computer unless you manually export it.\n\nAPI keys are also stored in your browser and are sent directly to the AI provider you choose when you use the chat feature. They are never sent to our server.\n\nBecause data is local-only, clearing your browser cache will erase all your resumes. Please use the Export Backup feature regularly to save your work as a downloadable .json file and keep it in a safe place."
  },
];

const ZH_QA: QA[] = [
  {
    q: "如何使用语造？",
    a: "语造是一个 AI 驱动的简历制作工具。在控制台创建新简历后，可使用 AI 聊天模式（描述需求，AI 自动生成）或手动编辑模式（直接填写）。在编辑器顶部工具栏切换模式。所有数据自动保存在浏览器的 localStorage 中。"
  },
  {
    q: "如何添加 API 密钥以使用聊天模式？",
    a: "点击侧边栏中的 API 设置，选择一个提供商（如 OpenAI、DeepSeek、Kimi）并输入你的 API 密钥。也可在自定义提供商下点击添加来添加自定义提供商。密钥仅存储在浏览器本地，不会发送到我们的服务器。"
  },
  {
    q: "什么是导出/导入 JSON 简历？",
    a: "导出功能生成一个可下载的 .json 备份文件，包含你所有的简历。用于保存进度或在浏览器之间迁移数据。导入功能读取之前导出的 .json 文件并恢复所有简历。支持单项目文件和打包备份文件两种格式。"
  },
  {
    q: "如何切换语言？",
    a: "点击控制台右上角的地球图标可在英文和中文之间切换。语言偏好会保存在浏览器中，跨会话持续生效。"
  },
  {
    q: "我的数据存在哪里？安全吗？",
    a: "你的所有数据（简历、对话记录、设置）都只存储在你浏览器的 localStorage 中。我们没有云端服务器、数据库或后端来存储你的任何个人信息。除非你手动导出，否则数据不会离开你的电脑。\n\nAPI 密钥同样只存储在浏览器中，仅在使用聊天功能时直接发送给你选择的 AI 提供商，绝不会发送到我们的服务器。\n\n由于数据仅保存在本地，清除浏览器缓存将导致所有简历丢失。请定期使用导出备份功能将你的作品保存为可下载的 .json 文件并存放在安全的地方。"
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HelpPanel({ open, onClose }: Props) {
  const { t, locale } = useLocale();
  const qaList = locale === "zh" ? ZH_QA : EN_QA;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {t("sidebar.help")}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {qaList.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="flex-1">{item.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
