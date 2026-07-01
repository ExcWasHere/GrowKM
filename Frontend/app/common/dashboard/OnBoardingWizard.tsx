import React, { useState } from "react";
import {
  ClipboardEdit,
  SearchCheck,
  Compass,
  Bot,
  ShieldCheck,
  Wallet,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Check,
} from "lucide-react";

interface OnboardingWizardProps {
  open: boolean;
  onFinish: () => void;
}

interface Step {
  id: string;
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "profile",
    icon: ClipboardEdit,
    eyebrow: "Wajib pertama",
    title: "Lengkapi profil usahamu",
    description:
      "Klik notifikasi \u201cLengkapi Profil Sekarang\u201d di dashboard, lalu isi data usahamu selengkap-lengkapnya. Khusus deskripsi usaha, tulis kalimat yang benar-benar mencerminkan usahamu ya makin jelas deskripsinya, makin akurat rekomendasi yang kamu dapat nanti.",
  },
  {
    id: "kbli",
    icon: SearchCheck,
    eyebrow: "Kalau belum punya KBLI",
    title: "Cocokkan kode KBLI-mu",
    description:
      "Belum punya kode KBLI? Buka sidebar, lalu pilih KBLI Matcher. AI kami bakal bantu menemukan kode yang paling pas berdasarkan deskripsi usaha yang sudah kamu isi.",
  },
  {
    id: "roadmap",
    icon: Compass,
    eyebrow: "Panduan langkah demi langkah",
    title: "Cek roadmap di Guide to Grow",
    description:
      "Lihat urutan izin dan sertifikasi yang perlu diselesaikan di fitur Guide to Grow, disusun sesuai level usahamu saat ini supaya nggak bingung mulai dari mana.",
  },
  {
    id: "lexa",
    icon: Bot,
    eyebrow: "Kalau masih bingung",
    title: "Tanya Lexa AI kapan aja",
    description:
      "Masih ragu soal legalitas usaha? Chat santai aja sama Lexa, asisten AI yang siap jawab pertanyaanmu soal perizinan dan formalisasi usaha.",
  },
  {
    id: "market",
    icon: ShieldCheck,
    eyebrow: "Setelah izin lengkap",
    title: "Pamerin izin di Market Gate",
    description:
      "Kalau izin-izin usahamu sudah tersimpan lengkap, tampilkan di Market Gate biar calon partner dan pembeli makin percaya sama usahamu.",
  },
  {
    id: "finance",
    icon: Wallet,
    eyebrow: "Rutin tiap hari",
    title: "Catat transaksi di Snap Cash",
    description:
      "Rekam pemasukan dan pengeluaran harian usahamu cukup lewat chat. Laporan keuanganmu otomatis rapi, tinggal unduh kapan pun kamu butuh.",
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  onFinish,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [collapsed, setCollapsed] = useState(false);

  if (!open) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setDirection("next");
      setStepIndex((i) => i + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex === 0) return;
    setDirection("prev");
    setStepIndex((i) => i - 1);
  };
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs md:text-sm font-bold text-amber-600">
          <Sparkles size={16} />
          Panduan Memulai GrowKM ({stepIndex + 1}/{STEPS.length})
        </span>
        <ArrowRight size={14} className="text-amber-400" />
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
      <style>{`
        @keyframes wizardSlideNext {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wizardSlidePrev {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .wizard-step-next { animation: wizardSlideNext 0.25s ease both; }
        .wizard-step-prev { animation: wizardSlidePrev 0.25s ease both; }
      `}</style>

      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(true)}
        aria-label="Kecilkan panduan"
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="p-4 md:p-5 pr-10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500">
            <Sparkles size={12} />
            Panduan Memulai GrowKM
          </span>
          <span className="text-[11px] font-bold text-gray-400">
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= stepIndex
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          key={step.id}
          className={`flex items-start gap-3 ${
            direction === "next" ? "wizard-step-next" : "wizard-step-prev"
          }`}
        >
          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <StepIcon size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mb-1.5">
              {step.eyebrow}
            </span>
            <h4 className="font-bold text-sm md:text-base text-gray-800 mb-1 leading-snug">
              {step.title}
            </h4>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-end gap-2 mt-4">
          {stepIndex > 0 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} />
              Kembali
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          >
            {isLast ? (
              <>
                Mulai Sekarang
                <Sparkles size={12} />
              </>
            ) : (
              <>
                Lanjut
                <ArrowRight size={12} />
              </>
            )}
            {isLast && <Check size={12} className="hidden" />}
          </button>
        </div>
      </div>
    </div>
  );
};