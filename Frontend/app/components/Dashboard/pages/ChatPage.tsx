import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Bot,
  User,
  History,
  Trash2,
  Plus,
  MessageSquare,
  ChevronLeft,
  X,
  AlertTriangle,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import { apiFetch } from "../../../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
  title?: string;
  preview?: string;
}

interface ChatPageProps {
  user: UserProfile;
  initialContext?: string;
}

const STEP_TYPES = [
  "nib",
  "spp_irt",
  "halal",
  "bpom",
  "merek",
  "sertifikat_standar",
] as const;
type StepType = (typeof STEP_TYPES)[number];

const QUICK_QUESTIONS = [
  "Apa syarat SPP-IRT?",
  "Bagaimana cara daftar halal gratis?",
  "Apa itu KBLI dan gimana pilih yang benar?",
  "Syarat KUR apa saja?",
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getSessionPreview(session: ChatSession): string {
  return session.preview ?? session.title ?? "Sesi percakapan";
}

const AssistantMarkdown: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => (
        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-gray-900">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="italic text-gray-700">{children}</em>
      ),
      h1: ({ children }) => (
        <h1 className="font-bold text-base text-gray-900 mt-3 mb-1.5">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="font-bold text-sm text-gray-900 mt-3 mb-1">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="font-semibold text-sm text-gray-800 mt-2 mb-1">{children}</h3>
      ),
      ul: ({ children }) => (
        <ul className="space-y-1 my-2 ml-1">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="space-y-1 my-2 ml-1 list-decimal list-inside">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span className="flex-1">{children}</span>
        </li>
      ),
      code: ({ children, className }) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
          return (
            <pre className="my-2 p-3 bg-gray-100 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 border border-gray-200">
              <code>{children}</code>
            </pre>
          );
        }
        return (
          <code className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-700">
            {children}
          </code>
        );
      },
      blockquote: ({ children }) => (
        <blockquote className="my-2 pl-3 border-l-2 border-amber-400 text-gray-600 italic text-sm">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-3 border-gray-200" />,
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-600 underline underline-offset-2 hover:text-amber-700 transition-colors"
        >
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="my-2 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs border-collapse">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-amber-50 text-gray-700">{children}</thead>
      ),
      th: ({ children }) => (
        <th className="px-3 py-2 text-left font-semibold border-b border-gray-200">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-3 py-2 border-b border-gray-100">{children}</td>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

// ─── Delete Confirm Modal (rendered via portal to avoid clipping) ────────────

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center gap-4"
        style={{ animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ animation: "shakeIcon 0.4s ease 0.2s both" }}
        >
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="font-bold text-gray-800 text-sm">Hapus sesi ini?</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            Riwayat percakapan ini akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-red-200"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Session Item ─────────────────────────────────────────────────────────────

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = () => {
    setShowDelete(false);
    setIsDeleting(true);
    // tunggu animasi exit selesai baru hapus dari list
    setTimeout(() => {
      onDelete();
    }, 350);
  };

  return (
    <>
      <div
        className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
          isDeleting
            ? "opacity-0 -translate-x-4 scale-95 pointer-events-none"
            : "opacity-100 translate-x-0 scale-100"
        } ${
          isActive
            ? "bg-amber-50 border border-amber-200"
            : "hover:bg-gray-50 border border-transparent"
        }`}
        onClick={!isDeleting ? onSelect : undefined}
      >
        <div
          className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isActive
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gray-100"
          }`}
        >
          <MessageSquare
            size={13}
            className={isActive ? "text-white" : "text-gray-400"}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-semibold truncate ${
              isActive ? "text-amber-800" : "text-gray-700"
            }`}
          >
            {getSessionPreview(session)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {formatRelativeTime(session.updated_at)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDelete(true);
          }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Portal modal — rendered outside SessionItem to avoid clipping */}
      {showDelete && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
};

// ─── Chat Page ────────────────────────────────────────────────────────────────

export const ChatPage: React.FC<ChatPageProps> = ({ user, initialContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: initialContext
        ? `Halo ${user.name}! 👋 Saya siap bantu kamu soal **${initialContext}**. Apa yang ingin kamu ketahui?`
        : `Halo **${user.name}**! 👋 Saya **Lexa**, asisten perizinan usahamu. Tanya apa saja soal proses perizinan dan formalisasi usaha **${user.business_profile?.business_name ?? "usahamu"}** ya!`,
    },
  ]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = CARD_META["chat"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await apiFetch("/api/chat/sessions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSessions(data.data ?? []);
    } catch {
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadSession = useCallback(
    async (id: string) => {
      try {
        const res = await apiFetch(`/api/chat/sessions/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const sessionData = data.data;
        const history: Message[] = (sessionData.messages ?? []).map(
          (m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })
        );
        setMessages(history.length > 0 ? history : messages);
        setSessionId(id);
        setSidebarOpen(false);
      } catch {}
    },
    [messages]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        const res = await apiFetch(`/api/chat/sessions/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (id === sessionId) {
          startNewChat();
        }
      } catch {}
    },
    [sessionId]
  );

  const startNewChat = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: "assistant",
        content: `Halo **${user.name}**! 👋 Saya **Lexa**, asisten perizinan usahamu. Tanya apa saja soal proses perizinan dan formalisasi usaha **${user.business_profile?.business_name ?? "usahamu"}** ya!`,
      },
    ]);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleToggleSidebar = () => {
    if (!sidebarOpen) fetchSessions();
    setSidebarOpen((v) => !v);
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: messageText },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const isFirstMessage = !sessionId;
      const contextStepType =
        isFirstMessage &&
        initialContext &&
        (STEP_TYPES as readonly string[]).includes(initialContext)
          ? (initialContext as StepType)
          : undefined;

      const res = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: messageText,
          ...(sessionId && { session_id: sessionId }),
          ...(contextStepType && { context_step_type: contextStepType }),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const result = data.data;

      if (!sessionId && result.session_id) {
        setSessionId(result.session_id);
        if (sidebarOpen) fetchSessions();
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: result.ai_response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Maaf, koneksi bermasalah. Coba lagi ya! 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shakeIcon {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-8deg); }
          40%  { transform: rotate(8deg); }
          60%  { transform: rotate(-5deg); }
          80%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-assistant { animation: slideInLeft 0.25s ease both; }
        .msg-user      { animation: slideInRight 0.25s ease both; }
        .quick-chip    { animation: fadeUp 0.3s ease both; }
        .sidebar-session { animation: fadeUp 0.2s ease both; }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f59e0b;
          animation: typingBounce 1.2s infinite ease-in-out;
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }

        ol .flex { display: list-item; list-style: decimal; margin-left: 1rem; }
        ol .flex span.rounded-full { display: none; }
      `}</style>

      <div className="flex gap-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-64 h-full bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-amber-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <History size={15} className="text-amber-500" />
                <span className="font-bold text-gray-700 text-sm">
                  Riwayat Chat
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3 shrink-0">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold hover:shadow-md hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
              >
                <Plus size={14} />
                Chat Baru
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
              {sessionsLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-gray-100 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <MessageSquare size={28} className="text-gray-200" />
                  <p className="text-xs text-gray-400 text-center">
                    Belum ada riwayat chat
                  </p>
                </div>
              ) : (
                sessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className="sidebar-session"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <SessionItem
                      session={session}
                      isActive={session.id === sessionId}
                      onSelect={() => loadSession(session.id)}
                      onDelete={() => deleteSession(session.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col min-w-0">
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-amber-100 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSidebar}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  sidebarOpen
                    ? "bg-amber-100 text-amber-600"
                    : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500"
                }`}
                title="Riwayat Chat"
              >
                {sidebarOpen ? (
                  <ChevronLeft size={16} />
                ) : (
                  <History size={16} />
                )}
              </button>

              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg shrink-0`}
              >
                {React.cloneElement(
                  meta.icon as React.ReactElement<{
                    size?: number;
                    className?: string;
                  }>,
                  { size: 28, className: "text-white" }
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-800 text-base">Lexa AI</h2>
                </div>
                <p className="text-gray-500 text-xs truncate">
                  Tanya apa saja soal legalitas usahamu
                </p>
              </div>

              <button
                onClick={startNewChat}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500 transition-all shrink-0"
                title="Chat Baru"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 p-4 pb-0 shrink-0">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="quick-chip px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold hover:border-amber-400 hover:bg-amber-100 transition-all active:scale-95"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user"
                    ? "flex-row-reverse msg-user"
                    : "flex-row msg-assistant"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={16} className="text-white" />
                  ) : (
                    <User size={16} className="text-gray-600" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-gray-50 border border-gray-200 text-gray-800"
                      : "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 whitespace-pre-wrap"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <AssistantMarkdown content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 msg-assistant">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3 p-4 border-t border-amber-100 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tanya soal perizinan usahamu..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};