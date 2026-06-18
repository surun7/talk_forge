"use client";

import { useState, useCallback } from "react";
import { X, Plus, Trash2, Eye, EyeOff, Save, KeyRound } from "lucide-react";
import { reloadProviders } from "@/lib/custom-providers-store";

interface CustomProvider {
  id: string;
  name: string;
  baseURL: string;
  model: string;
  apiKey: string;
}

const BUILTIN_KEYS = [
  { id: "openai", label: "OpenAI", envKey: "talk_forge_api_openai" },
  { id: "anthropic", label: "Anthropic", envKey: "talk_forge_api_anthropic" },
  { id: "google", label: "Google Gemini", envKey: "talk_forge_api_google" },
  { id: "groq", label: "Groq", envKey: "talk_forge_api_groq" },
];

const CUSTOM_STORAGE_KEY = "talk_forge_api_custom";

function readLS(key: string, fallback: string = ""): string {
  if (typeof window === "undefined") return fallback;
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function writeLS(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

const isZh = typeof navigator !== "undefined" && navigator.language.startsWith("zh");

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ApiSettingsPanel({ open, onClose }: Props) {
  const [builtinKeys, setBuiltinKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(BUILTIN_KEYS.map(k => [k.id, readLS(k.envKey)]))
  );
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>(() => {
    try { return JSON.parse(readLS(CUSTOM_STORAGE_KEY, "[]")); } catch { return []; }
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const toggleShowKey = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = useCallback(() => {
    BUILTIN_KEYS.forEach(k => writeLS(k.envKey, builtinKeys[k.id] || ""));
    writeLS(CUSTOM_STORAGE_KEY, JSON.stringify(customProviders));
    setSaved(true);
    reloadProviders();
    setTimeout(() => setSaved(false), 2000);
  }, [builtinKeys, customProviders]);

  const addCustom = () => {
    setCustomProviders(prev => [...prev, {
      id: "custom_" + Date.now(),
      name: "",
      baseURL: "https://api.openai.com/v1",
      model: "",
      apiKey: "",
    }]);
  };

  const updateCustom = (id: string, field: keyof CustomProvider, value: string) => {
    setCustomProviders(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeCustom = (id: string) => {
    setCustomProviders(prev => prev.filter(p => p.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {isZh ? "API 设置" : "API Settings"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Built-in providers */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {isZh ? "内置提供商" : "Built-in Providers"}
            </h3>
            <div className="space-y-3">
              {BUILTIN_KEYS.map(k => (
                <div key={k.id} className="flex items-center gap-2">
                  <label className="w-32 text-xs text-slate-600 dark:text-slate-300 shrink-0">{k.label}</label>
                  <div className="flex-1 relative">
                    <input
                      type={showKeys[k.id] ? "text" : "password"}
                      value={builtinKeys[k.id] || ""}
                      onChange={e => setBuiltinKeys(prev => ({ ...prev, [k.id]: e.target.value }))}
                      placeholder={isZh ? "API Key" : "API Key"}
                      className="w-full text-xs rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
                    />
                    <button onClick={() => toggleShowKey(k.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom providers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isZh ? "自定义提供商" : "Custom Providers"}
              </h3>
              <button onClick={addCustom}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg px-2 py-1 transition-colors font-medium">
                <Plus className="w-3 h-3" /> {isZh ? "添加" : "Add"}
              </button>
            </div>
            <div className="space-y-3">
              {customProviders.map(cp => (
                <div key={cp.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex gap-2">
                    <input value={cp.name} onChange={e => updateCustom(cp.id, "name", e.target.value)}
                      placeholder={isZh ? "名称 (如 Kimi)" : "Name (e.g. Kimi)"}
                      className="flex-1 text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400" />
                    <button onClick={() => removeCustom(cp.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input value={cp.baseURL} onChange={e => updateCustom(cp.id, "baseURL", e.target.value)}
                      placeholder="Base URL"
                      className="flex-1 text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400" />
                    <input value={cp.model} onChange={e => updateCustom(cp.id, "model", e.target.value)}
                      placeholder={isZh ? "模型名" : "Model"}
                      className="flex-1 text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400" />
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys[cp.id] ? "text" : "password"}
                      value={cp.apiKey}
                      onChange={e => updateCustom(cp.id, "apiKey", e.target.value)}
                      placeholder="API Key"
                      className="w-full text-xs rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
                    />
                    <button onClick={() => toggleShowKey(cp.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showKeys[cp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400">
            {isZh ? "API 密钥仅存储在浏览器本地" : "API keys stored locally in your browser"}
          </p>
          <button onClick={handleSave}
            className="flex items-center gap-2 h-9 px-5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200">
            {saved ? (isZh ? "已保存 ✓" : "Saved ✓") : (<><Save className="w-3.5 h-3.5" /> {isZh ? "保存" : "Save"}</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
