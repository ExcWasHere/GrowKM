import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Loader,
  ShieldCheck,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import { apiFetch } from "../../../lib/api";

interface ScannerPageProps {
  user: UserProfile;
}

interface KbliWarning {
  wrong_kbli: string;
  reason: string;
}

interface KbliMismatchAlert {
  user_kbli: string;
  recommended_kbli: string;
  reason: string;
}

interface RecommendResult {
  mode: "recommend";
  kbli_code: string;
  kbli_title: string;
  confidence: number;
  explanation: string;
}

interface ValidateResult {
  mode: "validate";
  kbli_code: string;
  kbli_name: string;
  explanation: string;
  warnings: KbliWarning[];
  mismatch_alert: KbliMismatchAlert | null;
}

type ScanResult = RecommendResult | ValidateResult;
type ConfirmState = "idle" | "loading" | "success" | "error";

const KBLI_EXAMPLES = [
  {
    code: "56101",
    label: "Restoran",
    desc: "Usaha makanan/minuman dengan tempat makan",
    risk: "Menengah Rendah",
  },
  {
    code: "10710",
    label: "Industri Produk Roti & Kue",
    desc: "Produksi pangan kemasan — butuh SPP-IRT atau BPOM",
    risk: "Menengah",
  },
  {
    code: "56290",
    label: "Usaha Jasa Boga Lainnya",
    desc: "Katering, nasi kotak rumahan",
    risk: "Menengah Rendah",
  },
];

export const ScannerPage: React.FC<ScannerPageProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");
  const meta = CARD_META["scanner"];
  const hasKbli = Boolean(user.business_profile?.kbli_code?.trim());

  const runScan = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setConfirmState("idle");

    try {
      if (hasKbli) {
        const response = await apiFetch(
          "/api/users/business-profile/kbli/validate",
          { method: "POST" }
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || `HTTP ${response.status}`);
        }
        const data = await response.json();
        setResult({
          mode: "validate",
          kbli_code: data.data.kbli_code,
          kbli_name: data.data.kbli_name,
          explanation: data.data.explanation,
          warnings: data.data.warnings ?? [],
          mismatch_alert: data.data.mismatch_alert ?? null,
        });
      } else {
        const response = await apiFetch(
          "/api/users/business-profile/kbli/recommend",
          { method: "POST" }
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || `HTTP ${response.status}`);
        }
        const data = await response.json();
        setResult({
          mode: "recommend",
          kbli_code: data.data.kbli_code,
          kbli_title: data.data.kbli_title,
          confidence: data.data.confidence,
          explanation: data.data.explanation,
        });
      }
    } catch (err: unknown) {
      console.error("Scan error:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(`Gagal menganalisis usahamu: ${message}. Coba lagi ya!`);
    } finally {
      setLoading(false);
    }
  };

  const confirmKbli = async (kbliCode: string) => {
    setConfirmState("loading");
    try {
      const response = await apiFetch("/api/users/business-profile/kbli", {
        method: "PATCH",
        body: JSON.stringify({ kbli_code: kbliCode }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setConfirmState("success");
    } catch (err) {
      console.error("Confirm KBLI error:", err);
      setConfirmState("error");
    }
  };

  const renderConfirmSection = (kbliCode: string) => {
    if (confirmState === "success") {
      return (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-xl px-4 py-3 mt-3">
          <ShieldCheck size={18} className="text-green-600 shrink-0" />
          <p className="text-green-700 text-sm font-semibold">
            KBLI <span className="font-black">{kbliCode}</span> berhasil dikonfirmasi & disimpan!
          </p>
        </div>
      );
    }
    if (confirmState === "error") {
      return (
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <XCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">Gagal menyimpan KBLI. Coba lagi ya!</p>
          </div>
          <button
            onClick={() => confirmKbli(kbliCode)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <RefreshCw size={18} /> Coba Lagi
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-2 mt-3">
        <div className="flex items-start gap-2 bg-white/60 border border-amber-200 rounded-xl px-4 py-3">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-gray-600 text-xs leading-relaxed">
            Pastikan KBLI ini sudah sesuai sebelum dikonfirmasi. KBLI yang dipilih akan tersimpan di profil bisnismu.
          </p>
        </div>
        <button
          onClick={() => confirmKbli(kbliCode)}
          disabled={confirmState === "loading"}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
        >
          {confirmState === "loading" ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <ShieldCheck size={18} />
          )}
          {confirmState === "loading" ? "Menyimpan..." : `Konfirmasi KBLI ${kbliCode}`}
        </button>
      </div>
    );
  };

  const renderRecommendResult = (r: RecommendResult) => (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle size={22} className="text-green-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-gray-800">{r.kbli_code}</span>
            <span className="text-gray-400 text-sm">—</span>
            <span className="text-gray-700 font-semibold text-sm">{r.kbli_title}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <span className="text-xs font-bold text-green-600">
              {Math.round(r.confidence * 100)}%
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{r.explanation}</p>
        </div>
      </div>
      {renderConfirmSection(r.kbli_code)}
    </div>
  );

  const renderValidateResult = (r: ValidateResult) => {
    const hasMismatch = !!r.mismatch_alert;

    return (
      <div className={`rounded-xl p-4 md:p-5 border shadow-sm space-y-4 ${
        hasMismatch ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
      }`}>
        {/* Status header */}
        <div className="flex items-start gap-3">
          {hasMismatch ? (
            <AlertTriangle size={22} className="text-orange-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle size={22} className="text-green-500 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-gray-800">{r.kbli_code}</span>
              <span className="text-gray-400 text-sm">—</span>
              <span className="text-gray-700 font-semibold text-sm">{r.kbli_name}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{r.explanation}</p>
          </div>
        </div>

        {/* Mismatch alert */}
        {hasMismatch && r.mismatch_alert && (
          <div className="bg-white/70 border border-orange-200 rounded-xl p-3.5 space-y-1">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">KBLI tidak sesuai</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-black text-gray-500 line-through">{r.mismatch_alert.user_kbli}</span>
              <span className="text-gray-400">→</span>
              <span className="font-black text-orange-600">{r.mismatch_alert.recommended_kbli}</span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">{r.mismatch_alert.reason}</p>
            {renderConfirmSection(r.mismatch_alert.recommended_kbli)}
          </div>
        )}

        {/* Valid state */}
        {!hasMismatch && (
          <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-xl px-4 py-3">
            <ShieldCheck size={18} className="text-green-600 shrink-0" />
            <p className="text-green-700 text-sm font-semibold">
              KBLI <span className="font-black">{user.business_profile?.kbli_code}</span> sudah valid untuk usahamu.
            </p>
          </div>
        )}

        {/* Warnings */}
        {r.warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
              KBLI yang sering tertukar:
            </p>
            {r.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/60 border border-gray-200 rounded-xl px-3.5 py-3">
                <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-gray-700 text-xs">{w.wrong_kbli}</span>
                  <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{w.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg`}
          >
            {React.cloneElement(
              meta.icon as React.ReactElement<{ size?: number; className?: string }>,
              { size: 36, className: "text-white" }
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-xl">KBLI Matcher</h2>
            <p className="text-gray-500 text-sm">
              {hasKbli
                ? "Validasi kesesuaian KBLI dengan deskripsi usahamu"
                : "Deteksi KBLI yang tepat berdasarkan deskripsi usahamu"}
            </p>
          </div>
        </div>
      </div>

      {/* Context info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700 space-y-0.5">
          {hasKbli ? (
            <>
              <p>
                KBLI saat ini:{" "}
                <span className="font-black text-amber-700">
                  {user.business_profile?.kbli_code}
                </span>
              </p>
              <p className="text-gray-500 text-xs">
                AI akan memvalidasi apakah KBLI ini sesuai dengan deskripsi usahamu.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Belum ada KBLI yang tersimpan.</p>
              <p className="text-gray-500 text-xs">
                AI akan merekomendasikan KBLI berdasarkan deskripsi usahamu:{" "}
                <span className="italic">
                  "{user.business_profile?.description || "—"}"
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={runScan}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40"
      >
        {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
        {loading
          ? hasKbli ? "Memvalidasi KBLI..." : "Menganalisis usahamu..."
          : hasKbli ? "Validasi KBLI Saya" : "Rekomendasikan KBLI"}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        result.mode === "recommend"
          ? renderRecommendResult(result)
          : renderValidateResult(result)
      )}

      {/* KBLI Reference */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-amber-200 shadow-sm">
        <p className="text-gray-500 text-xs font-black uppercase tracking-wider mb-3">
          Referensi KBLI Kuliner Umum
        </p>
        <div className="space-y-2.5">
          {KBLI_EXAMPLES.map((k) => (
            <div
              key={k.code}
              className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 font-black text-xs">{k.code}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-gray-800 font-bold text-sm">{k.label}</span>
                  <span className="px-2 py-0.5 bg-amber-200 rounded-full text-amber-700 text-[10px] font-bold">
                    {k.risk}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{k.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};