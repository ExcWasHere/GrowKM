import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Flame,
  Loader2,
  Download,
  TrendingUp,
  Paperclip,
  X,
  ImageIcon,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import { apiFetch } from "../../../lib/api";

interface FinancePageProps {
  user: UserProfile;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  product_name: string;
  amount: number;
  quantity: number;
  unit_price: number;
  record_date: string;
  created_at: string;
}

interface DailySummary {
  income: number;
  expense: number;
  profit: number;
  margin_pct: number;
}

interface FinanceMessage {
  role: "user" | "system";
  content: string;
  images?: string[]; // preview URLs (blob or public)
  transactions?: Transaction[];
  daily_summary?: DailySummary;
}

interface SelectedFile {
  file: File;
  previewUrl: string; // blob URL for instant preview
}

const fmtRp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const todayStr = () => new Date().toISOString().split("T")[0];

/** Upload a single file: get presigned URL, PUT to R2, return public_url */
async function uploadFileToR2(file: File): Promise<string> {
  const presignRes = await apiFetch("/api/upload/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
      folder: "receipts",
    }),
  });

  if (!presignRes.ok) throw new Error("Gagal mendapatkan presigned URL");

  const { data } = await presignRes.json();

  // PUT file directly to R2 (no auth header needed, it's a presigned URL)
  const putRes = await fetch(data.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!putRes.ok) throw new Error("Gagal mengunggah gambar ke storage");

  return data.public_url as string;
}

export const FinancePage: React.FC<FinancePageProps> = ({ user }) => {
  const meta = CARD_META["finance"];

  const [messages, setMessages] = useState<FinanceMessage[]>([
    {
      role: "system",
      content: `Halo ${user.name}! Ceritakan transaksi harianmu atau lampirkan foto nota/struk.\n\nContoh:\n"Hari ini jual 20 porsi nasi @25rb. Belanja bahan 180rb."`,
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [streak, setStreak] = useState<number>(
    user.business_profile?.streak_days ?? 0,
  );
  const [summary, setSummary] = useState<DailySummary>({
    income: 0,
    expense: 0,
    profit: 0,
    margin_pct: 0,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
    };
  }, [selectedFiles]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingStats(true);
      try {
        const res = await apiFetch("/api/finance/summary");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            setSummary({
              income: data.data.income ?? 0,
              expense: data.data.expense ?? 0,
              profit: data.data.profit ?? 0,
              margin_pct: data.data.margin_pct ?? 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load finance summary:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchSummary();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newSelected: SelectedFile[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newSelected]);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const send = useCallback(async () => {
    const text = input.trim();
    const hasFiles = selectedFiles.length > 0;

    if ((!text && !hasFiles) || sending) return;

    // Immediately show user bubble with blob preview images
    const previewImages = selectedFiles.map((sf) => sf.previewUrl);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text || "📎 Foto nota/struk",
        images: previewImages.length > 0 ? previewImages : undefined,
      },
    ]);
    setInput("");
    const filesToUpload = [...selectedFiles];
    setSelectedFiles([]);
    setSending(true);

    try {
      // Phase 1: upload all files in parallel
      let imageUrls: string[] = [];
      if (filesToUpload.length > 0) {
        imageUrls = await Promise.all(
          filesToUpload.map((sf) => uploadFileToR2(sf.file)),
        );
        // revoke blobs now that upload is done
        filesToUpload.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
      }

      // Generate unique Idempotency-Key for this transaction
      const idempotencyKey = crypto.randomUUID();

      // Phase 2: send to SnapCash
      const res = await apiFetch("/api/finance/record", {
        method: "POST",
        headers: {
            "x-idempotency-key": idempotencyKey
        },
        body: JSON.stringify({
          message: text || "Tolong ekstrak transaksi dari gambar nota ini.",
          record_date: todayStr(),
          ...(imageUrls.length > 0 && { images: imageUrls }),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        const { ai_response, transactions, daily_summary, streak_days } =
          data.data;

        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: ai_response,
            transactions: transactions ?? [],
            daily_summary,
          },
        ]);

        if (daily_summary) setSummary(daily_summary);
        if (typeof streak_days === "number") setStreak(streak_days);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `❌ Gagal menyimpan transaksi: ${msg}.\nCoba lagi ya!`,
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, selectedFiles, sending]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const downloadExcel = async () => {
    if (downloadingExcel) return;
    setDownloadingExcel(true);
    try {
      const res = await apiFetch("/api/finance/report/excel");
      if (!res.ok) throw new Error("Gagal mengunduh laporan");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-keuangan-${todayStr()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download excel error:", err);
    } finally {
      setDownloadingExcel(false);
    }
  };

  const canSend = (input.trim().length > 0 || selectedFiles.length > 0) && !sending;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        {/* Title + download */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg shrink-0`}
          >
            {React.cloneElement(
              meta.icon as React.ReactElement<{
                size?: number;
                className?: string;
              }>,
              { size: 28, className: "text-white" },
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-gray-800 text-lg md:text-xl leading-tight">
                  Snap Cash
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                  Catat keuangan via chat atau foto nota langsung
                </p>
              </div>
              <button
                onClick={downloadExcel}
                disabled={downloadingExcel}
                title="Unduh laporan Excel bulanan"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-700 text-xs font-bold transition-all shrink-0 disabled:opacity-50"
              >
                {downloadingExcel ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span className="hidden sm:inline">
                  {downloadingExcel ? "Mengunduh..." : "Laporan"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {loadingStats ? (
          <div className="flex items-center justify-center py-5 gap-2 text-amber-500">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-medium">
              Memuat ringkasan hari ini...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatPill
              label="Pemasukan"
              value={fmtRp(summary.income)}
              colorClass="bg-green-50 border-green-200 text-green-600"
              valueClass="text-green-700"
            />
            <StatPill
              label="Pengeluaran"
              value={fmtRp(summary.expense)}
              colorClass="bg-red-50 border-red-200 text-red-600"
              valueClass="text-red-700"
            />
            <StatPill
              label="Laba"
              value={fmtRp(summary.profit)}
              colorClass="bg-amber-50 border-amber-200 text-amber-600"
              valueClass="text-amber-700"
            />
          </div>
        )}

        {/* Streak */}
        <div className="mt-3 flex items-center gap-2 p-2.5 md:p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <Flame size={15} className="text-orange-500 shrink-0" />
          <p className="text-xs md:text-sm font-bold text-orange-700">
             Streak{" "}
            <span className="text-orange-500">{streak} hari</span> mencatat!
          </p>
        </div>
      </div>

      {/* Chat card */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col h-[60vh] md:h-[420px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          {messages.map((msg, i) => (
            <MessageRow key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 size={14} className="animate-spin text-amber-500" />
                <span>Mencatat...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Image previews */}
        {selectedFiles.length > 0 && (
          <div className="px-3 md:px-4 pt-2 flex gap-2 flex-wrap border-t border-amber-100">
            {selectedFiles.map((sf, i) => (
              <div key={i} className="relative group shrink-0">
                <img
                  src={sf.previewUrl}
                  alt={sf.file.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={11} />
                </button>
                <div className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-semibold truncate bg-black/40 rounded px-1">
                  {sf.file.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-end gap-2 p-3 md:p-4 border-t border-amber-100">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Lampirkan foto nota"
            className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-all shrink-0 disabled:opacity-40 active:scale-95"
          >
            <Paperclip size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              selectedFiles.length > 0
                ? "Tambah keterangan (opsional)..."
                : "Ceritakan transaksi harimu..."
            }
            disabled={sending}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 md:px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
          />

          {/* Send button */}
          <button
            onClick={send}
            disabled={!canSend}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 shrink-0"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── Sub-components ───────────────────────── */

const StatPill: React.FC<{
  label: string;
  value: string;
  colorClass: string;
  valueClass: string;
}> = ({ label, value, colorClass, valueClass }) => (
  <div className={`border rounded-xl p-2 md:p-3 text-center ${colorClass}`}>
    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide mb-0.5 opacity-80">
      {label}
    </p>
    <p className={`font-black text-[11px] md:text-sm leading-tight ${valueClass}`}>
      {value}
    </p>
  </div>
);

const DataRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}> = ({ label, value, bold, color = "text-gray-800" }) => (
  <div>
    <p className="text-gray-400 text-[10px] leading-tight">{label}</p>
    <p className={`text-xs leading-snug ${bold ? "font-black" : "font-semibold"} ${color}`}>
      {value}
    </p>
  </div>
);

const MessageRow: React.FC<{ msg: FinanceMessage }> = ({ msg }) => (
  <div>
    {/* Chat bubble */}
    <div
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
          msg.role === "user"
            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-sm"
            : "bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}
      >
        {msg.content}

        {/* Image thumbnails inside user bubble */}
        {msg.images && msg.images.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-1.5 ${msg.images.length === 1 ? "" : ""}`}>
            {msg.images.map((url, i) =>
              url.startsWith("blob:") ? (
                // blob preview (instant)
                <img
                  key={i}
                  src={url}
                  alt={`Lampiran ${i + 1}`}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border-2 border-white/30"
                />
              ) : (
                // public URL (after upload)
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl border-2 border-white/30 bg-white/20 flex flex-col items-center justify-center gap-1 text-white/80 hover:bg-white/30 transition-colors">
                    <ImageIcon size={22} />
                    <span className="text-[9px] font-semibold">Lihat Gambar</span>
                  </div>
                </a>
              )
            )}
          </div>
        )}
      </div>
    </div>

    {/* Transaction detail cards */}
    {msg.transactions && msg.transactions.length > 0 && (
      <div className="mt-2 space-y-2">
        {msg.transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-green-50 border border-green-200 rounded-xl p-3"
          >
            <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  tx.type === "income" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {tx.product_name || "Transaksi"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <DataRow
                label="Tipe"
                value={tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
              />
              <DataRow label="Total" value={fmtRp(tx.amount)} bold />
              {tx.quantity > 0 && (
                <DataRow label="Qty" value={`${tx.quantity} pcs`} />
              )}
              {tx.unit_price > 0 && (
                <DataRow label="Harga satuan" value={fmtRp(tx.unit_price)} />
              )}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Daily summary card */}
    {msg.daily_summary && (
      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp size={11} />
          Ringkasan Hari Ini
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <DataRow
            label="Pemasukan"
            value={fmtRp(msg.daily_summary.income)}
            color="text-green-700"
          />
          <DataRow
            label="Pengeluaran"
            value={fmtRp(msg.daily_summary.expense)}
            color="text-red-600"
          />
          <DataRow
            label="Laba kotor"
            value={fmtRp(msg.daily_summary.profit)}
            color="text-amber-700"
            bold
          />
          <DataRow
            label="Margin"
            value={`${msg.daily_summary.margin_pct}%`}
            color="text-amber-700"
            bold
          />
        </div>
      </div>
    )}
  </div>
);