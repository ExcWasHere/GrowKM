import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Zap,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import { apiFetch } from "../../../app/lib/api";
type MatchStatus = "eligible" | "almost" | "locked";

interface AdvisorRecommendation {
  opportunity_id: string;
  title: string;
  priority_rank: number;
  match_status: MatchStatus;
  missing_steps: string[];
  why_this_fits: string;
  why_now: string;
  next_step: string;
  caveats?: string;
  source_url?: string;
}

interface AdvisorResponse {
  status: string;
  message: string;
  data: {
    user_context_summary: string;
    recommendations: AdvisorRecommendation[];
    generated_at: string;
  };
}

const STATUS_META: Record<
  MatchStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  eligible: {
    label: "Eligible",
    icon: <CheckCircle size={12} />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  almost: {
    label: "Hampir",
    icon: <Clock size={12} />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  locked: {
    label: "Terkunci",
    icon: <Lock size={12} />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

const RANK_LABEL = ["🥇", "🥈", "🥉"];
const RecommendationCard: React.FC<{ rec: AdvisorRecommendation; index: number }> = ({
  rec,
  index,
}) => {
  const [expanded, setExpanded] = useState(index === 0);
  const sm = STATUS_META[rec.match_status];

  return (
    <div
      className={`bg-white rounded-xl border ${sm.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}
    >
      {/* Top accent */}
      <div
        className={`h-1 w-full ${
          rec.match_status === "eligible"
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : rec.match_status === "almost"
            ? "bg-gradient-to-r from-amber-400 to-orange-500"
            : "bg-gray-200"
        }`}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl shrink-0 mt-0.5">{RANK_LABEL[index] ?? `#${index + 1}`}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.bg} ${sm.color} ${sm.border}`}
              >
                {sm.icon}
                {sm.label}
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Prioritas #{rec.priority_rank}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-800 leading-snug">{rec.title}</h3>
          </div>
        </div>

        {/* Why this fits */}
        <div className="flex items-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2.5 border border-amber-100 mb-3">
          <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            {rec.why_this_fits}
          </p>
        </div>

        {/* Toggle detail */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-amber-500 transition-colors mb-3"
        >
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Sembunyikan detail" : "Lihat selengkapnya"}
        </button>

        {/* Expandable */}
        {expanded && (
          <div className="space-y-3 mb-3">
            {/* Why now */}
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                <CalendarDays size={10} /> Kenapa Sekarang?
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{rec.why_now}</p>
            </div>

            {/* Next step */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowRight size={10} /> Langkah Berikutnya
              </p>
              <p className="text-[11px] text-green-800 leading-relaxed font-medium">
                {rec.next_step}
              </p>
            </div>

            {/* Caveats */}
            {rec.caveats && (
              <div className="flex items-start gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                <AlertCircle size={12} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">{rec.caveats}</p>
              </div>
            )}

            {/* Missing steps */}
            {rec.missing_steps && rec.missing_steps.length > 0 && (
              <div>
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide mb-1">
                  Perlu diselesaikan dulu:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.missing_steps.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600"
                    >
                      ❌ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {rec.source_url && rec.match_status !== "locked" && (
          <a
            href={rec.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg border transition-all ${
              rec.match_status === "eligible"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent hover:shadow-md"
                : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
            }`}
          >
            Mulai Sekarang <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export const AdvisorSection: React.FC = () => {
  const [data, setData] = useState<AdvisorResponse["data"] | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const hasFetched = React.useRef(false);

  const fetchAdvisor = async () => {
    setLoadState("loading");
    setError(null);
    try {
      const res = await apiFetch("/api/opportunities/advisor");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AdvisorResponse = await res.json();
      setData(json.data);
      setLoadState("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat rekomendasi");
      setLoadState("error");
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAdvisor();
  }, []);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    hasFetched.current = false;
    fetchAdvisor();
  };

  const generatedAt = data?.generated_at
    ? new Date(data.generated_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((p) => !p)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsOpen((p) => !p); }}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-amber-50/40 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              Rekomendasi AI Advisor
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider">
                Lexa
              </span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {loadState === "success" && data
                ? `${data.recommendations.length} rekomendasi personal untukmu`
                : "Personalisasi berdasarkan profil usahamu"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loadState === "success" && (
            <button
              onClick={handleRefresh}
              className="text-amber-400 hover:text-amber-600 transition-colors p-1 rounded"
              title="Refresh rekomendasi"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={`text-amber-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-amber-100 p-4 md:p-5 space-y-4">
          {/* Loading */}
          {(loadState === "idle" || loadState === "loading") && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles size={18} className="text-amber-500" />
                </div>
                <Loader2
                  size={40}
                  className="animate-spin text-amber-300 absolute inset-0"
                />
              </div>
              <p className="text-xs text-gray-400 font-medium">
                AI sedang menganalisis profilmu...
              </p>
            </div>
          )}

          {/* Error */}
          {loadState === "error" && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Gagal memuat rekomendasi</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => { hasFetched.current = false; fetchAdvisor(); }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Success */}
          {loadState === "success" && data && (
            <>
              {/* Context summary */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <BadgeCheck size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium line-clamp-2">
                  {data.user_context_summary.split("\n")[0]}
                </p>
              </div>

              {/* Hint */}
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                <p className="text-[11px] text-gray-500 font-medium">
                  Top {data.recommendations.length} peluang terbaik khusus untuk usahamu
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.recommendations.map((rec, i) => (
                  <RecommendationCard key={rec.opportunity_id} rec={rec} index={i} />
                ))}
              </div>

              {/* Footer */}
              {generatedAt && (
                <p className="text-[10px] text-gray-300 text-center">
                  Diperbarui: {generatedAt}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};