import React, { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Search, Loader } from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";

interface ScannerPageProps {
  user: UserProfile;
}

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

interface ScanResult {
  status: "ok" | "warning";
  kbli: string;
  label: string;
  message: string;
  suggestions: string[];
}

const DEMO_RESULT: ScanResult = {
  status: "warning",
  kbli: "56290",
  label: "Jasa Boga Lainnya",
  message:
    "Berdasarkan deskripsimu, KBLI yang paling sesuai adalah 56290. Namun kami mendeteksi ada potensi mismatch: jika kamu menjual minuman dalam kemasan botol, produk ini mungkin butuh BPOM MD, bukan hanya SPP-IRT.",
  suggestions: [
    "Pastikan SPP-IRT hanya digunakan untuk pangan rumah tangga tanpa kemasan tertutup.",
    "Untuk minuman kemasan botol/pouch → perlu izin BPOM MD.",
    'Pilih KBLI 56290 untuk katering/nasi kotak, HINDARI "10710" jika belum punya izin BPOM.',
  ],
};

export const ScannerPage: React.FC<ScannerPageProps> = ({ user }) => {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setResult(DEMO_RESULT);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg">
            🛡️
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-xl">Compliance Scanner</h2>
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
          {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? "Menganalisis..." : "Scan KBLI"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl p-4 md:p-5 border shadow-sm ${
            result.status === "ok"
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
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
                <span className="text-gray-700 font-semibold text-sm">{result.label}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result.message}</p>
            </div>
          </div>

          <div className="space-y-2">
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