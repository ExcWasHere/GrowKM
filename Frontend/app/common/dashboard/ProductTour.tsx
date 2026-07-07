import React, { useState, useLayoutEffect, useRef, useCallback, useEffect } from "react";
import {
  Home,
  User,
  Shield,
  Map,
  MessageCircle,
  BarChart2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Check,
} from "lucide-react";

interface ProductTourProps {
  open: boolean;
  onFinish: () => void;
}

interface TourStep {
  id: string;
  target: string;
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    target: "dashboard",
    icon: Home,
    eyebrow: "Mulai dari sini",
    title: "Beranda, ringkasan informasi usaha kamu",
    description:
      "Progress formalisasi, level usaha, sampai pencapaian, semua bisa kamu pantau di Beranda.",
  },
  {
    id: "profile",
    target: "profile",
    icon: User,
    eyebrow: "Langkah pertama",
    title: "Lengkapi profil usahamu",
    description:
      "Klik tombol ini dan isi deskripsi usaha sedetail mungkin, biar rekomendasi yang kamu dapat makin akurat.",
  },
  {
    id: "scanner",
    target: "scanner",
    icon: Shield,
    eyebrow: "Kalau belum punya KBLI",
    title: "Dapatkan Rekomendasi kode KBLI usahamu",
    description:
      "Belum punya kode KBLI? GrowKM akan bantu dapetin kode yang paling pas sesuai deskripsi usahamu.",
  },
  {
    id: "roadmap",
    target: "roadmap",
    icon: Map,
    eyebrow: "Panduan langkah demi langkah perizinan usahamu",
    title: "Cek roadmap di Guide to Grow",
    description:
      "Urutan izin dan sertifikasi yang perlu diselesaikan, disusun sesuai kondisi usahamu saat ini.",
  },
  {
    id: "chat",
    target: "chat",
    icon: MessageCircle,
    eyebrow: "Kalau masih bingung",
    title: "Tanya Lexa AI kapan aja",
    description:
      "Masih ragu soal legalitas usaha? Chat santai aja sama Lexa, asisten pintar yang siap bantu.",
  },
  {
    id: "market",
    target: "market",
    icon: BarChart2,
    eyebrow: "Setelah izin lengkap",
    title: "Cari peluang income di Market Gate",
    description:
      "Kalau izin usahamu udah lengkap, kamu akan mendapat rekomendasi peluang usaha yang cocok.",
  },
  {
    id: "finance",
    target: "finance",
    icon: DollarSign,
    eyebrow: "Rutin tiap hari",
    title: "Catat transaksi usahamu di Snap Cash",
    description:
      "Catat pemasukan dan pengeluaran harian cukup lewat chat, laporan keuanganmu otomatis rapi.",
  },
];

const MARGIN = 12;
const GAP = 14;
const TOOLTIP_WIDTH = 300;
const TOOLTIP_FALLBACK_HEIGHT = 200;
export const TOUR_SIDEBAR_EVENT = "growkm:tour-sidebar";

type Placement = "right" | "left" | "bottom" | "top" | "center";

interface Positioned {
  rect: DOMRect | null;
  placement: Placement;
  top: number;
  left: number;
}

function computePosition(rect: DOMRect | null, tooltipH: number): Positioned {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect || rect.width === 0 || rect.right <= 0 || rect.left >= vw) {
    return {
      rect: null,
      placement: "center",
      top: vh - tooltipH - MARGIN * 2,
      left: Math.max(MARGIN, vw / 2 - TOOLTIP_WIDTH / 2),
    };
  }

  if (rect.right + GAP + TOOLTIP_WIDTH <= vw - MARGIN) {
    return {
      rect,
      placement: "right",
      top: clamp(rect.top + rect.height / 2 - tooltipH / 2, MARGIN, vh - tooltipH - MARGIN),
      left: rect.right + GAP,
    };
  }
  if (rect.left - GAP - TOOLTIP_WIDTH >= MARGIN) {
    return {
      rect,
      placement: "left",
      top: clamp(rect.top + rect.height / 2 - tooltipH / 2, MARGIN, vh - tooltipH - MARGIN),
      left: rect.left - GAP - TOOLTIP_WIDTH,
    };
  }
  if (rect.bottom + GAP + tooltipH <= vh - MARGIN) {
    return {
      rect,
      placement: "bottom",
      top: rect.bottom + GAP,
      left: clamp(rect.left, MARGIN, vw - TOOLTIP_WIDTH - MARGIN),
    };
  }
  return {
    rect,
    placement: "top",
    top: Math.max(MARGIN, rect.top - GAP - tooltipH),
    left: clamp(rect.left, MARGIN, vw - TOOLTIP_WIDTH - MARGIN),
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), Math.max(min, max));
}

export const ProductTour: React.FC<ProductTourProps> = ({ open, onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Positioned>({
    rect: null,
    placement: "center",
    top: 0,
    left: 0,
  });

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const StepIcon = step.icon;

  const recalc = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    const r = el ? el.getBoundingClientRect() : null;
    setRect(r);
    const tooltipH = tooltipRef.current?.offsetHeight || TOOLTIP_FALLBACK_HEIGHT;
    setPos(computePosition(r, tooltipH));
  }, [step.target]);

  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(
      new CustomEvent(TOUR_SIDEBAR_EVENT, { detail: { open: true } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent(TOUR_SIDEBAR_EVENT, { detail: { open: false } })
      );
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    recalc();
    const raf = requestAnimationFrame(recalc);
    const interval = setInterval(recalc, 250);
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open, recalc]);

  if (!open) return null;

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
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

  const spotlightPad = 8;
  const hasSpotlight = pos.placement !== "center" && rect;

  return (
    <div className="fixed inset-0 z-[200]">
      <style>{`
        @keyframes tourPulse {
          0% { box-shadow: 0 0 0 0 rgba(251,146,60,0.55); }
          70% { box-shadow: 0 0 0 14px rgba(251,146,60,0); }
          100% { box-shadow: 0 0 0 0 rgba(251,146,60,0); }
        }
        @keyframes tourFadeNext {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tourFadePrev {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .tour-step-next { animation: tourFadeNext 0.25s ease both; }
        .tour-step-prev { animation: tourFadePrev 0.25s ease both; }
        .tour-pulse-ring { animation: tourPulse 1.8s ease-out infinite; }
      `}</style>

      {/* Backdrop */}
      {hasSpotlight ? (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect!.top - spotlightPad,
            left: rect!.left - spotlightPad,
            width: rect!.width + spotlightPad * 2,
            height: rect!.height + spotlightPad * 2,
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.65)",
          }}
        >
          <div className="tour-pulse-ring absolute inset-0 rounded-2xl border-2 border-amber-400" />
        </div>
      ) : (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(15,23,42,0.55)" }}
        />
      )}
      <div className="fixed inset-0" />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed rounded-xl border border-amber-200 bg-white shadow-2xl overflow-hidden"
        style={{ top: pos.top, left: pos.left, width: TOOLTIP_WIDTH }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        <div className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500">
              Kenalan sama GrowKM yuk!
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400">
                {stepIndex + 1} / {TOUR_STEPS.length}
              </span>
              <button
                onClick={onFinish}
                aria-label="Lewati tur"
                className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-4">
            {TOUR_STEPS.map((s, i) => (
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

          <div
            key={step.id}
            className={`flex items-start gap-3 ${
              direction === "next" ? "tour-step-next" : "tour-step-prev"
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
                  <Check size={12} />
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};