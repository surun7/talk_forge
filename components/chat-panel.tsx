"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Resume } from "@/lib/resume-schema";
import ManualEditor from "./editor/manual-editor";
import {
 Send,
 Sparkles,
 Camera,
 Menu,
 Plus,
 MessageSquare,
 Trash2,
 Pencil,
 Check,
} from "lucide-react";

interface Message {
 role: "user" | "assistant";
 content: string;
 time: number;
}

interface Conversation {
 id: string;
 title: string;
 messages: Message[];
 createdAt: number;
}

interface ChatPanelProps {
 resume: Resume;
 onResumeUpdate: (resume: Resume) => void;
 onOpenPhotoModal: () => void;
 editMode: "agent" | "manual";
 conversationResetKey?: number;
 sectionOrder: string[];
 onMoveSectionUp: (key: string) => void;
 onMoveSectionDown: (key: string) => void;
  externalConversations?: Conversation[];
  onConversationsChange?: (convs: Conversation[]) => void;
}

function timeStr(ts: number) {
 const d = new Date(ts);
 const h = String(d.getHours()).padStart(2, "0");
 const m = String(d.getMinutes()).padStart(2, "0");
 return `${h}:${m}`;
}

function dateStr(ts: number) {
 const d = new Date(ts);
 const months = [
 "Jan",
 "Feb",
 "Mar",
 "Apr",
 "May",
 "Jun",
 "Jul",
 "Aug",
 "Sep",
 "Oct",
 "Nov",
 "Dec",
 ];
 return `${months[d.getMonth()]} ${d.getDate()}`;
}

function makeConversation(num: number): Conversation {
 const now = Date.now();
 return {
 id: `conv_${now}_${Math.random().toString(36).slice(2, 8)}`,
 title: `New Conversation ${num}`,
 messages: [
 {
 role: "assistant",
 content:
 "Hi! I can help build your resume. Tell me about your experience, education, skills, or projects and I'll add them.",
 time: now,
 },
 ],
 createdAt: now,
 };
}

export default function ChatPanel({
 resume,
 onResumeUpdate,
 onOpenPhotoModal,
 editMode,
 conversationResetKey,
 sectionOrder,
 onMoveSectionUp,
 onMoveSectionDown,
 externalConversations,
 onConversationsChange,
}: ChatPanelProps) {
 const [conversations, setConversationsInternal] = useState<Conversation[]>(() => {
 return [
 {
 id: "conv_init",
 title: "New Conversation 1",
 messages: [
 {
 role: "assistant" as const,
 content:
 "Hi! I can help build your resume. Tell me about your experience, education, skills, or projects and I'll add them.",
 time: 0,
 },
 ],
 createdAt: 0,
 },
 ];
 });
 const [activeId, setActiveId] = useState<string>("conv_init");
  // Sync to external storage (deferred via setTimeout to avoid setState-during-render)
  const setConversations = useCallback((action: React.SetStateAction<Conversation[]>) => {
    setConversationsInternal(prev => {
      const next = typeof action === "function" ? (action as (prev: Conversation[]) => Conversation[])(prev) : action;
      console.log("[CHAT SET] next count:", next.length, "first title:", next[0]?.title, "msg count:", next[0]?.messages?.length);
      // Defer parent notification to next microtask
      setTimeout(() => {
        if (onConversationsChange) onConversationsChange(next);
      }, 0);
      return next;
    });
  }, [onConversationsChange]);

 const [hydrated, setHydrated] = useState(false);
 const [showHistory, setShowHistory] = useState(false);
 const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
 const [editingTitleValue, setEditingTitleValue] = useState("");
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const [streamingText, setStreamingText] = useState("");
 const convCounterRef = useRef(1);
 const [agentStatus, setAgentStatus] = useState<
 "idle" | "thinking" | "editing" | "done"
 >("idle");
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const historyRef = useRef<HTMLDivElement>(null);

 // Load conversations from project or localStorage fallback
 useEffect(() => {
 if (externalConversations && externalConversations.length > 0) {
 setConversations(externalConversations);
 setActiveId(externalConversations[0].id);
 } else {
 try {
 const raw = localStorage.getItem("talk_forge_conversations");
 if (raw) {
 const parsed = JSON.parse(raw);
 if (Array.isArray(parsed) && parsed.length > 0) {
 setConversations(parsed as Conversation[]);
 setActiveId(parsed[0].id);
 }
 }
 } catch {}
 }
 setHydrated(true);
 }, [externalConversations]);

 // localStorage fallback for non-project mode
 useEffect(() => {
 if (!hydrated || onConversationsChange) return;
 try { localStorage.setItem("talk_forge_conversations", JSON.stringify(conversations)); } catch {}
 }, [conversations, hydrated, onConversationsChange]);

 // Reset conversations when parent signals new resume
 useEffect(() => {
 if (conversationResetKey === undefined || conversationResetKey === 0)
 return;
 convCounterRef.current = 1;
 const fresh = makeConversation(1);
 setConversations([fresh]);
 setActiveId(fresh.id);
 setStreamingText("");
 setAgentStatus("idle");
 setShowHistory(false);
 }, [conversationResetKey]);

 const activeConversation = conversations.find((c) => c.id === activeId);
 const messages = activeConversation?.messages ?? [];

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, streamingText]);

 useEffect(() => {
 const ta = textareaRef.current;
 if (!ta) return;
 ta.style.height = "auto";
 ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
 }, [input]);

 // Close history panel on outside click
 useEffect(() => {
 if (!showHistory) return;
 const handler = (e: MouseEvent) => {
 if (
 historyRef.current &&
 !historyRef.current.contains(e.target as Node)
 ) {
 setShowHistory(false);
 }
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, [showHistory]);

 const addMessage = useCallback((convId: string, msg: Message) => {
 setConversations((prev) =>
 prev.map((c) => {
 if (c.id !== convId) return c;
 const updated = [...c.messages, msg];
 const firstUser = updated.find((m) => m.role === "user");
 const title = firstUser ? firstUser.content.slice(0, 40) : c.title;
 return { ...c, messages: updated, title };
 }),
 );
 }, []);

 function switchConversation(id: string) {
 setActiveId(id);
 setShowHistory(false);
 setStreamingText("");
 setAgentStatus("idle");
 }

 function newConversation() {
 convCounterRef.current += 1;
 const fresh = makeConversation(convCounterRef.current);
 setConversations((prev) => [fresh, ...prev]);
 setActiveId(fresh.id);
 setShowHistory(false);
 setStreamingText("");
 setAgentStatus("idle");
 }

 function startRename(id: string, currentTitle: string, e: React.MouseEvent) {
 e.stopPropagation();
 setEditingTitleId(id);
 setEditingTitleValue(currentTitle);
 }

 function commitRename(id: string) {
 const trimmed = editingTitleValue.trim();
 if (trimmed) {
 setConversations((prev) =>
 prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)),
 );
 }
 setEditingTitleId(null);
 }

 function deleteConversation(id: string, e: React.MouseEvent) {
 e.stopPropagation();
 // Check BEFORE the functional updater so counter only increments once
 const remaining = conversations.filter((c) => c.id !== id);
 if (remaining.length === 0) {
 convCounterRef.current = 1; // reset to 1 when all deleted
 }
 let nextId: string | null = null;
 setConversations((prev) => {
 const filtered = prev.filter((c) => c.id !== id);
 if (filtered.length === 0) {
 const fresh = makeConversation(convCounterRef.current);
 nextId = fresh.id;
 return [fresh];
 }
 if (id === activeId) {
 nextId = filtered[0].id;
 }
 return filtered;
 });
 if (nextId) {
 setTimeout(() => setActiveId(nextId!), 0);
 }
 }

 async function sendMessage() {
 const text = input.trim();
 if (!text || loading) return;
 const convId = activeId;
 const currentMessages =
 conversations.find((c) => c.id === convId)?.messages ?? [];
 const userMsg: Message = { role: "user", content: text, time: Date.now() };

 addMessage(convId, userMsg);
 setInput("");
 setLoading(true);
 setStreamingText("");
 setAgentStatus("thinking");

 try {
 const res = await fetch("/api/chat", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 messages: [...currentMessages, userMsg].map((m) => ({
 role: m.role,
 content: m.content,
 })),
 resume,
 }),
 });

 if (!res.ok) {
 let errMsg = `HTTP ${res.status}`;
 try {
 const err = await res.json();
 errMsg = err.error || err.message || errMsg;
 } catch {}
 addMessage(convId, {
 role: "assistant",
 content: `Error: ${errMsg}`,
 time: Date.now(),
 });
 setLoading(false);
 setAgentStatus("idle");
 return;
 }

 const reader = res.body!.getReader();
 const decoder = new TextDecoder();
 let assistantContent = "";
 let resumeUpdated = false;
 let buffer = "";

 while (true) {
 const { done, value } = await reader.read();
 if (done) break;
 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split("\n");
 buffer = lines.pop() || "";
 for (const line of lines) {
 if (!line.trim()) continue;
 try {
 const data = JSON.parse(line);
 if (data.type === "error") {
 setStreamingText("");
 addMessage(convId, {
 role: "assistant",
 content: `Error: ${data.error}`,
 time: Date.now(),
 });
 setLoading(false);
 setAgentStatus("idle");
 return;
 } else if (data.type === "tooling") {
 setAgentStatus("editing");
 } else if (data.type === "text") {
 if (!assistantContent) setAgentStatus("editing");
 assistantContent += data.text;
 setStreamingText(assistantContent);
 } else if (data.type === "resume") {
 resumeUpdated = true;
 setAgentStatus("done");
 onResumeUpdate(data.resume);
 }
 } catch (e) {
 console.error(
 "[chat] Parse error:",
 e,
 "line:",
 line.slice(0, 100),
 );
 }
 }
 }
 // Process remaining buffer
 if (buffer.trim()) {
 try {
 const data = JSON.parse(buffer);
 if (data.type === "resume") {
 resumeUpdated = true;
 setAgentStatus("done");
 onResumeUpdate(data.resume);
 }
 } catch (e) {
 console.error("[chat] Final parse error:", e);
 }
 }
 setStreamingText("");
 const fallback = resumeUpdated
 ? "Resume updated."
 : "No response received — check server logs.";
 addMessage(convId, {
 role: "assistant",
 content: assistantContent || fallback,
 time: Date.now(),
 });
 setTimeout(() => setAgentStatus("idle"), 1500);
 } catch (err) {
 const msg = err instanceof Error ? err.message : "Network error";
 addMessage(convId, {
 role: "assistant",
 content: `Error: ${msg}`,
 time: Date.now(),
 });
 setAgentStatus("idle");
 } finally {
 setLoading(false);
 }
 }

 function handleKeyDown(e: React.KeyboardEvent) {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 }

 const statusLabel =
 agentStatus === "thinking"
 ? "Thinking..."
 : agentStatus === "editing"
 ? "Editing resume..."
 : agentStatus === "done"
 ? "Updated"
 : "";

 return (
 <div
 className="flex flex-col h-full min-h-0"
 style={{ background: "var(--panel-bg)" }}
 >
 {editMode === "manual" ? (
 <div
 key="manual"
 className="flex-1 min-h-0 overflow-y-auto animate-slide-from-right"
 >
 <ManualEditor
 resume={resume}
 onChange={onResumeUpdate}
 onOpenPhotoModal={onOpenPhotoModal}
 sectionOrder={sectionOrder}
 onMoveSectionUp={onMoveSectionUp}
 onMoveSectionDown={onMoveSectionDown}
 />
 </div>
 ) : (
 <div
 key="agent"
 className="flex-1 min-h-0 flex flex-col animate-slide-from-left"
 >
 {/* Header bar with hamburger menu */}
 <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-slate-100 dark:shadow-[0_0_0_1px_#1e293b] relative">
 <button
 onClick={() => setShowHistory(!showHistory)}
 className="w-8 h-8 rounded-lg shadow-ring dark:shadow-ring-d flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-[0_0_0_1px_#94a3b8] dark:hover:shadow-[0_0_0_1px_#64748b] transition-all duration-200"
 title="Conversations"
 >
 <Menu className="w-4 h-4" />
 </button>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate flex-1">
 {activeConversation?.title || "Chat"}
 </span>
 {conversations.length > 1 && (
 <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
 {conversations.length}
 </span>
 )}

 {/* History dropdown */}
 {showHistory && (
 <>
 <div
 className="fixed inset-0 z-40"
 onClick={() => setShowHistory(false)}
 />
 <div
 ref={historyRef}
 className="absolute top-full left-4 mt-1 z-50 w-72 bg-white dark:bg-slate-800 shadow-ring dark:shadow-ring-d rounded-2xl shadow-xl overflow-hidden"
 >
 <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:shadow-[0_0_0_1px_#334155]">
 <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
 Conversations
 </span>
 <button
 onClick={newConversation}
 className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg px-2 py-1 transition-colors font-medium"
 >
 <Plus className="w-3 h-3" /> New
 </button>
 </div>
 <div className="max-h-64 overflow-y-auto">
 {conversations.map((conv) => (
 <div
 key={conv.id}
 onClick={() => switchConversation(conv.id)}
 className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors group ${
 conv.id === activeId
 ? "bg-indigo-50 dark:bg-indigo-900/20"
 : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
 }`}
 >
 <MessageSquare
 className={`w-3.5 h-3.5 flex-shrink-0 ${
 conv.id === activeId
 ? "text-indigo-500"
 : "text-slate-400"
 }`}
 />
 <div className="flex-1 min-w-0">
 {editingTitleId === conv.id ? (
 <input
 value={editingTitleValue}
 onChange={(e) =>
 setEditingTitleValue(e.target.value)
 }
 onKeyDown={(e) => {
 if (e.key === "Enter") commitRename(conv.id);
 if (e.key === "Escape") setEditingTitleId(null);
 }}
 onBlur={() => commitRename(conv.id)}
 onClick={(e) => e.stopPropagation()}
 onMouseDown={(e) => e.stopPropagation()}
 className="w-full text-xs bg-white dark:bg-slate-700 shadow-[0_0_0_1px_#a5b4fc] dark:shadow-[0_0_0_1px_#4f46e5] rounded px-1.5 py-0.5 outline-none"
 autoFocus
 />
 ) : (
 <p
 className={`text-xs truncate ${
 conv.id === activeId
 ? "text-indigo-700 dark:text-indigo-300 font-medium"
 : "text-slate-600 dark:text-slate-300"
 }`}
 >
 {conv.title}
 </p>
 )}
 <p className="text-[10px] text-slate-400 dark:text-slate-500">
 {dateStr(conv.createdAt)}
 </p>
 </div>
 <div className="flex items-center gap-2 ml-2">
 {editingTitleId === conv.id ? (
 <button
 onClick={(e) => {
 e.stopPropagation();
 commitRename(conv.id);
 }}
 className="flex items-center justify-center rounded-lg shadow-[0_0_0_1px_#a7f3d0] dark:shadow-[0_0_0_1px_#065f46] text-emerald-500 hover:text-emerald-600 hover:shadow-[0_0_0_1px_#6ee7b7] dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 p-1"
 title="Save"
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 ) : (
 <button
 onClick={(e) =>
 startRename(conv.id, conv.title, e)
 }
 className="opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg shadow-ring dark:shadow-ring-d text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:shadow-[0_0_0_1px_#cbd5e1] dark:hover:shadow-[0_0_0_1px_#64748b] hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 p-1"
 title="Rename"
 >
 <Pencil className="w-3.5 h-3.5" />
 </button>
 )}
 <button
 onClick={(e) => deleteConversation(conv.id, e)}
 className="opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg shadow-ring dark:shadow-ring-d text-slate-400 hover:text-red-400 hover:shadow-[0_0_0_1px_#fca5a5] dark:hover:shadow-[0_0_0_1px_#b91c1c] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 p-1"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>

 {/* Messages */}
 <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-3 space-y-4">
 {messages.map((msg, i) => (
 <div
 key={i}
 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in`}
 >
 {msg.role === "assistant" && (
 <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
 <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
 </div>
 )}
 <div
 className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}
 >
 <div
 className={`text-sm rounded-2xl px-3.5 py-2.5 leading-relaxed ${
 msg.role === "user"
 ? "bg-indigo-600 text-white rounded-br-md"
 : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md"
 }`}
 >
 <p className="whitespace-pre-wrap">{msg.content}</p>
 </div>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 px-1">
 {timeStr(msg.time)}
 </p>
 </div>
 </div>
 ))}
 {streamingText && (
 <div className="flex justify-start animate-in">
 <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
 <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
 </div>
 <div className="max-w-[85%]">
 <div className="text-sm rounded-2xl rounded-bl-md px-3.5 py-2.5 leading-relaxed bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
 <p className="whitespace-pre-wrap">
 {streamingText}
 <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse rounded-full align-middle" />
 </p>
 </div>
 </div>
 </div>
 )}
 {loading && !streamingText && (
 <div className="flex justify-start">
 <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
 <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
 </div>
 <div className="text-sm rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800">
 <span className="inline-flex gap-1">
 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
 <span
 className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"
 style={{ animationDelay: ".15s" }}
 />
 <span
 className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"
 style={{ animationDelay: ".3s" }}
 />
 </span>
 </div>
 </div>
 )}
 {statusLabel && (
 <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 px-2">
 <span className="w-1.5 h-1.5 rounded-full bg-green-400" />{" "}
 {statusLabel}
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input */}
 <div
 className="border-t border-slate-100 dark:shadow-[0_0_0_1px_#1e293b] p-3 pb-5"
 style={{ background: "var(--panel-bg)" }}
 >
 <div className="flex items-end gap-2">
 <button
 onClick={onOpenPhotoModal}
 className="flex-shrink-0 w-9 h-9 rounded-xl shadow-ring dark:shadow-ring-d flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-500 hover:shadow-[0_0_0_1px_#a5b4fc] hover:shadow-sm hover:shadow-indigo-200/50 dark:hover:border-indigo-700 transition-all duration-200"
 title="Upload photo"
 >
 <Camera className="w-4 h-4" />
 </button>
 <textarea
 ref={textareaRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Tell me what to add or change..."
 disabled={loading}
 rows={1}
 className="flex-1 resize-none text-sm shadow-ring dark:shadow-ring-d rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:shadow-[inset_0_0_0_2px_#818cf8] focus: disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:shadow-[0_0_0_1px_#94a3b8] dark:hover:shadow-[0_0_0_1px_#64748b] hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-200"
 />
 <button
 onClick={sendMessage}
 disabled={loading || !input.trim()}
 className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/30 disabled:opacity-40 text-white flex items-center justify-center transition-all duration-200"
 >
 <Send className="w-4 h-4 ml-0.5" />
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
