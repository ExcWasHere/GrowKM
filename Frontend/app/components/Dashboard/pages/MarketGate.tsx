import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart2,
  CheckCircle,
  Clock,
  Lock,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Loader2,
  Filter,
  Star,
  Building2,
  ShoppingBag,
  Landmark,
  CalendarDays,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import type { UserProfile, BusinessProfile } from "../../Dashboard/types";
import { apiFetch } from "../../../lib/api";

type MatchStatus = "eligible" | "almost" | "locked";
type OpportunityCategory =
  | "pembiayaan"
  | "marketplace"
  | "pameran"
  | "program_pemerintah"
  | "vendor_supply_chain";

interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  provider: string;
  description?: string;
  estimated_value?: string;
  value_description?: string;
  region?: string;
  required_steps: string[];
  nice_to_have_steps?: string[];
  additional_requirements?: string[];
  deadline?: string | null;
  source_url?: string;
  match_status?: MatchStatus;
  missing_steps?: string[];
  match_score?: number;
  seen_at?: string | null;
  clicked_at?: string | null;
}

interface GetOpportunitiesResponse {
  status: string;
  message: string;
  data: {
    summary: {
      eligible_count: number;
      almost_count: number;
      locked_count: number;
    };
    opportunities: Opportunity[];
  };
}

interface RetriggerResponse {
  status: string;
  data: {
    eligible: number;
    almost: number;
    locked: number;
    total: number;
    newly_unlocked: string[];
  };
}

interface UnlockedOpportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  provider: string;
  estimated_value?: string;
  missing_steps: string[];
  unlocked_at: string;
}

interface GetUnlockedResponse {
  status: string;
  data: {
    newly_unlocked: UnlockedOpportunity[];
  };
}

interface GetOpportunityDetailResponse {
  status: string;
  data: Opportunity;
}

interface MarketPageProps {
  user: UserProfile;
  businessProfile: BusinessProfile;
  onNavigate?: (page: string) => void;
}

type FilterType = "all" | MatchStatus;

const CATEGORY_META: Record<
  OpportunityCategory,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  pembiayaan: {
    label: "Pembiayaan",
    icon: <DollarSign size={14} />,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  vendor_supply_chain: {
    label: "Vendor / Supply Chain",
    icon: <Building2 size={14} />,
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
  marketplace: {
    label: "Marketplace",
    icon: <ShoppingBag size={14} />,
    color: "text-pink-700",
    bg: "bg-pink-50 border-pink-200",
  },
  program_pemerintah: {
    label: "Program Pemerintah",
    icon: <Landmark size={14} />,
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
  },
  pameran: {
    label: "Event & Pameran",
    icon: <CalendarDays size={14} />,
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
};

const STATUS_META: Record<
  MatchStatus,
  {
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  }
> = {
  eligible: {
    label: "Bisa Apply Sekarang",
    shortLabel: "Eligible",
    icon: <CheckCircle size={14} />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  almost: {
    label: "Hampir Eligible",
    shortLabel: "Hampir",
    icon: <Clock size={14} />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  locked: {
    label: "Terkunci",
    shortLabel: "Terkunci",
    icon: <Lock size={14} />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

const STEP_LABEL: Record<string, string> = {
  nib: "NIB",
  spp_irt: "SPP-IRT / PIRT",
  halal: "Sertifikat Halal",
  bpom: "Izin BPOM",
  merek: "Pendaftaran Merek",
  laporan_keuangan: "Laporan Keuangan",
  sertifikat_standar: "Sertifikat Standar",
};

const SummaryBanner: React.FC<{
  eligible: number;
  almost: number;
  locked: number;
  onRetrigger: () => void;
  retriggerLoading: boolean;
}> = ({ eligible, almost, locked, onRetrigger, retriggerLoading }) => (
  <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 md:p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <BarChart2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Ringkasan Peluang</p>
          <p className="text-sm font-bold text-gray-800">Diperbarui otomatis</p>
        </div>
      </div>
      <button
        onClick={onRetrigger}
        disabled={retriggerLoading}
        className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-orange-500 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={13} className={retriggerLoading ? "animate-spin" : ""} />
        Perbarui
      </button>
    </div>

    <div className="grid grid-cols-3 gap-2 md:gap-3">
      <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
        <p className="text-2xl font-black text-green-600">{eligible}</p>
        <p className="text-[10px] font-bold text-green-700 mt-0.5">Eligible</p>
        <p className="text-[9px] text-green-600 mt-0.5">bisa apply</p>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
        <p className="text-2xl font-black text-amber-600">{almost}</p>
        <p className="text-[10px] font-bold text-amber-700 mt-0.5">Hampir</p>
        <p className="text-[9px] text-amber-600 mt-0.5">kurang 1-2 step</p>
      </div>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
        <p className="text-2xl font-black text-gray-500">{locked}</p>
        <p className="text-[10px] font-bold text-gray-600 mt-0.5">Terkunci</p>
        <p className="text-[9px] text-gray-500 mt-0.5">selesaikan dulu</p>
      </div>
    </div>

    {almost > 0 && (
      <div className="mt-3 flex items-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
        <Zap size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
          Kamu punya <span className="font-bold">{almost} peluang</span> yang hampir bisa
          diakses! Selesaikan izin berikutnya di roadmap untuk unlock mereka.
        </p>
      </div>
    )}
  </div>
);

const FilterBar: React.FC<{
  active: FilterType;
  counts: Record<FilterType, number>;
  onChange: (f: FilterType) => void;
}> = ({ active, counts, onChange }) => {
  const tabs: { key: FilterType; label: string }[] = [
    { key: "all",      label: `Semua (${counts.all})`         },
    { key: "eligible", label: `Eligible (${counts.eligible})` },
    { key: "almost",   label: `Hampir (${counts.almost})`     },
    { key: "locked",   label: `Terkunci (${counts.locked})`   },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
            active === key
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const OpportunityCard: React.FC<{
  opp: Opportunity;
  onViewDetail: (id: string) => void;
}> = ({ opp, onViewDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const status = opp.match_status ?? "locked";
  const sm = STATUS_META[status];
  const cm = CATEGORY_META[opp.category] ?? CATEGORY_META.program_pemerintah;

  const hasExpandableContent =
    (opp.required_steps?.length > 0) ||
    (status === "almost" && opp.missing_steps && opp.missing_steps.length > 0) ||
    !!opp.deadline;

  return (
    <div
      className={`bg-white rounded-xl border ${sm.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}
    >
      {/* Top accent strip */}
      <div
        className={`h-1 w-full ${
          status === "eligible"
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : status === "almost"
            ? "bg-gradient-to-r from-amber-400 to-orange-500"
            : "bg-gray-200"
        }`}
      />

      <div className="p-4">
        {/* Header — always visible */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cm.bg} ${cm.color}`}
              >
                {cm.icon}
                {cm.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sm.bg} ${sm.color}`}
              >
                {sm.shortLabel}
              </span>
            </div>
            <h3
              className={`text-sm font-bold leading-snug ${
                status === "locked" ? "text-gray-500" : "text-gray-800"
              }`}
            >
              {opp.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{opp.provider}</p>
          </div>
          <div
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              status === "eligible"
                ? "bg-green-100"
                : status === "almost"
                ? "bg-amber-100"
                : "bg-gray-100"
            }`}
          >
            {status === "eligible" && <CheckCircle size={14} className="text-green-500" />}
            {status === "almost"   && <TrendingUp  size={14} className="text-amber-500"  />}
            {status === "locked"   && <Lock        size={14} className="text-gray-400"   />}
          </div>
        </div>

        {/* Estimated value — always visible */}
        {opp.estimated_value && (
          <div className={`flex items-center gap-1.5 mb-3 ${status === "locked" ? "opacity-50" : ""}`}>
            <Star size={12} className="text-amber-400" />
            <span className="text-xs font-bold text-gray-700">{opp.estimated_value}</span>
          </div>
        )}

        {/* Dropdown toggle — only if there's expandable content */}
        {hasExpandableContent && (
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-amber-500 transition-colors mb-3"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
            {isExpanded ? "Sembunyikan detail" : "Lihat detail syarat"}
          </button>
        )}

        {/* Expandable content */}
        {isExpanded && (
          <div className="mb-3 space-y-3">
            {/* Required steps */}
            {opp.required_steps?.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Syarat
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.required_steps.map((req) => {
                    const isMissing = opp.missing_steps?.includes(req);
                    return (
                      <span
                        key={req}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isMissing
                            ? "bg-red-50 border-red-200 text-red-600"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        {isMissing ? "❌" : "✅"} {STEP_LABEL[req] ?? req}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Almost hint */}
            {status === "almost" && opp.missing_steps && opp.missing_steps.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium">
                  Selesaikan{" "}
                  <span className="font-bold">
                    {opp.missing_steps.map((s) => STEP_LABEL[s] ?? s).join(", ")}
                  </span>{" "}
                  untuk unlock peluang ini
                </p>
              </div>
            )}

            {/* Deadline */}
            {opp.deadline && (
              <div className="flex items-center gap-1.5">
                <CalendarDays size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500">
                  Deadline:{" "}
                  {new Date(opp.deadline).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetail(opp.id)}
            className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
              status === "eligible"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent hover:shadow-md"
                : status === "almost"
                ? "bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
                : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            {status === "eligible" ? (
              <><span>Lihat Detail</span><ChevronRight size={13} /></>
            ) : status === "almost" ? (
              <><span>Cara Unlock</span><ArrowRight size={13} /></>
            ) : (
              "Terkunci"
            )}
          </button>
          {opp.source_url && status !== "locked" && (
            <a
              href={opp.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const OpportunityDetailContent: React.FC<{ opp: Opportunity }> = ({ opp }) => {
  const status = opp.match_status ?? "locked";
  const sm = STATUS_META[status];
  const cm = CATEGORY_META[opp.category] ?? CATEGORY_META.program_pemerintah;

  return (
    <>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cm.bg} ${cm.color}`}
        >
          {cm.icon} {cm.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${sm.bg} ${sm.color}`}
        >
          {sm.label}
        </span>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-1">{opp.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{opp.provider}</p>

      {opp.estimated_value && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <Star size={16} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] text-amber-600 font-semibold uppercase">Estimasi Nilai</p>
            <p className="font-black text-amber-700">{opp.estimated_value}</p>
            {opp.value_description && (
              <p className="text-[10px] text-amber-600 mt-0.5">{opp.value_description}</p>
            )}
          </div>
        </div>
      )}

      {opp.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{opp.description}</p>
      )}

      {status === "locked" && opp.missing_steps && opp.missing_steps.length > 0 && (
        <div className="mb-4 flex items-start gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
          <Lock size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Selesaikan dulu untuk unlock:</p>
            <div className="flex flex-wrap gap-1.5">
              {opp.missing_steps.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600"
                >
                  {STEP_LABEL[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {opp.required_steps?.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Syarat Wajib
          </p>
          <div className="space-y-2">
            {opp.required_steps.map((req) => {
              const isMissing = opp.missing_steps?.includes(req);
              return (
                <div
                  key={req}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${
                    isMissing ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                  }`}
                >
                  <span>{isMissing ? "❌" : "✅"}</span>
                  <span
                    className={`text-sm font-bold ${
                      isMissing ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {STEP_LABEL[req] ?? req}
                  </span>
                  {isMissing && (
                    <span className="text-[10px] text-red-500 ml-auto">Belum punya</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {opp.additional_requirements && opp.additional_requirements.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Syarat Tambahan
          </p>
          <ul className="space-y-1.5">
            {opp.additional_requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-amber-400 mt-0.5">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opp.deadline && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <CalendarDays size={14} />
          Deadline:{" "}
          {new Date(opp.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}

      {opp.source_url && status !== "locked" && (
        <a
          href={opp.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold py-3 rounded-xl hover:shadow-md transition-all"
        >
          Kunjungi Sumber <ExternalLink size={14} />
        </a>
      )}
    </>
  );
};

const OpportunityDetailModal: React.FC<{
  id: string;
  onClose: () => void;
}> = ({ id, onClose }) => {
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`/api/opportunities/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<GetOpportunityDetailResponse>;
      })
      .then((json) => setOpp(json.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <p className="font-bold text-gray-800 text-sm">Detail Peluang</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-amber-500" />
            </div>
          )}
          {error && (
            <p className="text-center py-12 text-red-500 text-sm">
              Gagal memuat detail: {error}
            </p>
          )}
          {opp && !loading && <OpportunityDetailContent opp={opp} />}
        </div>
      </div>
    </div>
  );
};

// ─── NewlyUnlockedSection WITH DROPDOWN ────────────────────────────────────
const NewlyUnlockedSection: React.FC = () => {
  const [unlocked, setUnlocked] = useState<UnlockedOpportunity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // ← dropdown state

  useEffect(() => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    apiFetch(`/api/opportunities/unlocked?since=${encodeURIComponent(since)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<GetUnlockedResponse>;
      })
      .then((json) => setUnlocked(json.data.newly_unlocked ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || unlocked.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden">
      {/* ── Header / Toggle button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-amber-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Baru Ter-unlock!
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              <span className="font-bold">{unlocked.length} peluang baru</span> berhasil dibuka 🎉
            </p>
          </div>
        </div>

        {/* Badge count + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-black flex items-center justify-center">
            {unlocked.length}
          </span>
          <ChevronDown
            size={15}
            className={`text-amber-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ── Collapsible content ── */}
      {isOpen && (
        <div className="px-4 pb-4 md:px-5 md:pb-5 border-t border-amber-200/60">
          <div className="grid grid-cols-1 gap-2 mt-3">
            {unlocked.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-xl border border-amber-200 p-3 shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={11} className="text-green-500" />
                  </div>
                  <p className="text-[10px] font-bold text-green-700">Baru unlock</p>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-snug">{opp.title}</p>
                {opp.estimated_value && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">{opp.estimated_value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MarketPage: React.FC<MarketPageProps> = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [summary, setSummary] = useState({ eligible_count: 0, almost_count: 0, locked_count: 0 });
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [retriggerLoading, setRetriggerLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const res = await apiFetch("/api/opportunities");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: GetOpportunitiesResponse = await res.json();
      setOpportunities(json.data.opportunities ?? []);
      setSummary(json.data.summary);
      setLoadState("success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat peluang";
      setError(msg);
      setLoadState("error");
    }
  }, []);

  const handleRetrigger = async () => {
    setRetriggerLoading(true);
    try {
      const res = await apiFetch("/api/opportunities/match", { method: "POST" });
      if (!res.ok) throw new Error();
      const json: RetriggerResponse = await res.json();
      setSummary({
        eligible_count: json.data.eligible,
        almost_count: json.data.almost,
        locked_count: json.data.locked,
      });
    } catch {
      // lanjut fetch anyway
    } finally {
      await fetchOpportunities();
      setRetriggerLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const filtered =
    filter === "all"
      ? opportunities
      : opportunities.filter((o) => o.match_status === filter);

  const counts: Record<FilterType, number> = {
    all:      opportunities.length,
    eligible: summary.eligible_count,
    almost:   summary.almost_count,
    locked:   summary.locked_count,
  };

  if (loadState === "idle" || loadState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-amber-500" />
        <p className="text-sm text-gray-500 font-medium">Mencocokkan peluang untukmu...</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle size={20} className="text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800 text-sm">Gagal memuat peluang</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchOpportunities}
          className="text-xs font-bold text-amber-600 hover:text-orange-500 underline underline-offset-2"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      <SummaryBanner
        eligible={summary.eligible_count}
        almost={summary.almost_count}
        locked={summary.locked_count}
        onRetrigger={handleRetrigger}
        retriggerLoading={retriggerLoading}
      />
      <NewlyUnlockedSection />
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-amber-500" />
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Feed Peluang</p>
        </div>
        <FilterBar active={filter} counts={counts} onChange={setFilter} />
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">Tidak ada peluang di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  onViewDetail={(id) => setSelectedId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <OpportunityDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
};