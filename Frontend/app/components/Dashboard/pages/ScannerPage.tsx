import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Loader,
  ShieldCheck,
  XCircle,
  Info,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import { apiFetch } from "../../../lib/api";

interface ScannerPageProps {
  user: UserProfile;
}

interface ScanResult {
  status: "ok" | "warning";
  kbli: string;
  label: string;
  message: string;
  suggestions: string[];
}

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

const SYSTEM_PROMPT = `Kamu adalah konsultan KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) yang ahli untuk UMKM Indonesia.

Tugasmu: Analisis deskripsi usaha dari pengguna dan rekomendasikan kode KBLI yang paling tepat.

Aturan penting:
- Kode KBLI selalu 5 digit angka
- Deteksi potensi mismatch atau ketidaksesuaian izin
- Berikan saran konkret dan actionable
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami

Kamu HARUS merespons HANYA dengan JSON valid (tanpa markdown, tanpa backtick), dengan format ini:
{
  "status": "ok" | "warning",
  "kbli": "<5-digit kode>",
  "label": "<nama KBLI>",
  "message": "<penjelasan singkat mengapa KBLI ini cocok, dan potensi masalah jika ada>",
  "suggestions": ["<saran 1>", "<saran 2>", "<saran 3>"]
}

Gunakan "warning" jika ada potensi mismatch izin atau ambiguitas. Gunakan "ok" jika sudah jelas sesuai.`;

export const ScannerPage: React.FC<ScannerPageProps> = ({ user }) => {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");

  const meta = CARD_META["scanner"];

  const runScan = async () => {
    if (!desc.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setConfirmState("idle");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Tolong analisis usaha berikut dan rekomendasikan KBLI yang tepat:\n\n"${desc}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.content
        ?.map((block: { type: string; text?: string }) =>
          block.type === "text" ? block.text : ""
        )
        .join("")
        .trim();

      const parsed: ScanResult = JSON.parse(rawText);
      setResult(parsed);
    } catch (err) {
      console.error("Scan error:", err);
      setError(
        "Gagal menganalisis usahamu. Coba lagi dalam beberapa saat ya!"
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmKbli = async () => {
    if (!result) return;

    setConfirmState("loading");

    try {
      const response = await apiFetch("/api/users/business-profile/kbli", {
        method: "PATCH",
        body: JSON.stringify({ kbli_code: result.kbli }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setConfirmState("success");
    } catch (err) {
      console.error("Confirm KBLI error:", err);
      setConfirmState("error");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
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
            <h2 className="font-bold text-gray-800 text-xl">KBLI Matcher</h2>
            <p className="text-gray-500 text-sm">
              Deteksi KBLI yang tepat & cek kepatuhan izin usahamu
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border border-amber-200 rounded-xl p-4 md:p-5 shadow-sm">
        <label className="text-gray-700 text-sm font-bold mb-3 block">
          Deskripsikan usahamu secara spesifik:
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={`Contoh: "Saya buka usaha nasi kotak dari dapur rumah, jual ke kantor dan acara. Juga jual jus buah dalam botol kemasan."`}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
        />
        <button
          onClick={runScan}
          disabled={!desc.trim() || loading}
          className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40"
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {loading ? "Menganalisis..." : "Scan KBLI"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl p-4 md:p-5 border shadow-sm ${
            result.status === "ok"
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          {/* Result header */}
          <div className="flex items-start gap-3 mb-4">
            {result.status === "ok" ? (
              <CheckCircle size={22} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={22} className="text-orange-500 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-gray-800">{result.kbli}</span>
                <span className="text-gray-400 text-sm">—</span>
                <span className="text-gray-700 font-semibold text-sm">
                  {result.label}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.message}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2 mb-5">
            <p className="text-gray-500 text-xs font-black uppercase tracking-wider">
              Rekomendasi:
            </p>
            {result.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                {s}
              </div>
            ))}
          </div>

          {/* Confirm section */}
          {confirmState === "success" ? (
            <div className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-xl px-4 py-3">
              <ShieldCheck size={18} className="text-green-600 shrink-0" />
              <p className="text-green-700 text-sm font-semibold">
                KBLI <span className="font-black">{result.kbli}</span> berhasil dikonfirmasi & disimpan!
              </p>
            </div>
          ) : confirmState === "error" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <XCircle size={18} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-sm">
                  Gagal menyimpan KBLI. Coba lagi ya!
                </p>
              </div>
              <button
                onClick={confirmKbli}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <ShieldCheck size={18} />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-white/60 border border-amber-200 rounded-xl px-4 py-3">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-gray-600 text-xs leading-relaxed">
                  Pastikan KBLI ini sudah sesuai dengan usahamu sebelum dikonfirmasi.
                  KBLI yang dipilih akan tersimpan di profil bisnismu.
                </p>
              </div>
              <button
                onClick={confirmKbli}
                disabled={confirmState === "loading"}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
              >
                {confirmState === "loading" ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {confirmState === "loading"
                  ? "Menyimpan..."
                  : `Konfirmasi KBLI ${result.kbli}`}
              </button>
            </div>
          )}
        </div>
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