import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader } from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import { apiFetch } from "../../../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export const ChatPage: React.FC<ChatPageProps> = ({ user, initialContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: initialContext
        ? `Halo ${user.name}! 👋 Saya siap bantu kamu soal ${initialContext}. Apa yang ingin kamu ketahui?`
        : `Halo ${user.name}! 👋 Saya Lexa, Tanya apa saja soal proses perizinan dan formalisasi usaha ${user.businessName} ya!`,
    },
  ]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const meta = CARD_META["chat"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          content: "Maaf, koneksi bermasalah. Coba lagi ya!",
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
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg`}
          >
            {React.cloneElement(
              meta.icon as React.ReactElement<{
                size?: number;
                className?: string;
              }>,
              { size: 36, className: "text-white" }
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-base">Lexa AI</h2>
            <p className="text-gray-500 text-xs">
              Tanya apa saja soal legalitas usahamu
            </p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 p-4 pb-0">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold hover:border-amber-400 hover:bg-amber-100 transition-all"
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
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-amber-400 to-orange-500"
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
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-gray-50 border border-gray-200 text-gray-800"
                  : "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Loader size={16} className="text-amber-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 p-4 border-t border-amber-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tanya soal perizinan usahamu..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};