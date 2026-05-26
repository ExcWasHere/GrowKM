"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sprout, Users, Target, Heart, Zap, Globe, Star, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IOCallback = () => void;
const ioCallbacks = new Map<Element, IOCallback>();
let sharedIO: IntersectionObserver | null = null;

const getIO = () => {
  if (typeof window === "undefined") return null;
  if (!sharedIO) {
    sharedIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cb = ioCallbacks.get(entry.target);
          if (cb) {
            cb();
            sharedIO?.unobserve(entry.target);
            ioCallbacks.delete(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
  }
  return sharedIO;
};

const useReveal = (): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getIO();
    if (!io) return;
    ioCallbacks.set(el, () => setVisible(true));
    io.observe(el);
    return () => {
      io.unobserve(el);
      ioCallbacks.delete(el);
    };
  }, []);

  return [ref, visible];
};

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeUp = ({ children, delay = 0, className = "" }: FadeUpProps) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${className} ${visible ? "au-visible" : "au-hidden"}`}
      style={visible && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

interface CountUpProps {
  target: number;
  suffix?: string;
}

const CountUp = ({ target, suffix = "" }: CountUpProps) => {
  const [ref, visible] = useReveal();
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;
    const duration = 1400;
    let startTime: number | null = null;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
};

interface TeamMember { name: string; role: string; initials: string; color: string; bg: string; }
const team: TeamMember[] = [
  { name: "Savero Hardiana",  role: "Co-Founder & CEO",       initials: "SH", color: "#f97316", bg: "#fff7ed" },
  { name: "Excell Christian",    role: "Co-Founder & Product",   initials: "EC", color: "#d97706", bg: "#fffbeb" },
  { name: "Hafidz Rabbani", role: "Head of Engineering",    initials: "HR", color: "#ea580c", bg: "#fff7ed" },
    { name: "Goyounjung Canz",   role: "Lead Designer",          initials: "GC", color: "#c2410c", bg: "#fffbeb" },
];

interface Value { icon: LucideIcon; title: string; desc: string; }
const values: Value[] = [
  { icon: Target, title: "Berpihak pada UMKM",      desc: "Setiap fitur kami dirancang dari sudut pandang pelaku UMKM, bukan birokrat atau konsultan." },
  { icon: Zap,    title: "Simpel, bukan sederhana", desc: "Regulasi memang rumit — tapi cara menyampaikannya bisa dibuat lebih manusiawi." },
  { icon: Heart,  title: "Berbasis regulasi resmi", desc: "Setiap panduan dan rekomendasi bersumber dari regulasi resmi pemerintah Indonesia." },
  { icon: Globe,  title: "Membangun ekosistem",     desc: "Kami percaya UMKM yang formal adalah pondasi ekonomi Indonesia yang kuat." },
];

interface Milestone { year: string; title: string; desc: string; }
const milestones: Milestone[] = [
  { year: "2023",    title: "Riset & Validasi",      desc: "Wawancara mendalam dengan 200+ pelaku UMKM dari Jawa, Bali, dan Sulawesi." },
  { year: "Q1 2024", title: "GrowKM Alpha",          desc: "Peluncuran versi alpha dengan fitur KBLI Matcher dan Roadmap Perizinan dasar." },
  { year: "Q3 2024", title: "Lexa AI Hadir",         desc: "Asisten AI berbasis regulasi resmi, menjawab pertanyaan legalitas dalam bahasa sehari-hari." },
  { year: "2025",    title: "MarketGate & Ekspansi", desc: "Fitur peluang bisnis pasca-izin diluncurkan. GrowKM hadir di 15+ kota." },
];

export default function AboutUs() {
  const [activeTimeline, setActiveTimeline] = useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen font-sans">
      <style>{`
        /* Base hidden state — opacity only, no transform on all elements saves composite layers */
        .au-hidden { opacity: 0; }

        /* Visible: fire CSS animation once */
        .au-visible {
          animation: au-fadein 0.5s ease both;
        }

        @keyframes au-fadein {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hero entrance — CSS only, no JS needed */
        @keyframes au-hero {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .au-hero-1 { animation: au-hero 0.55s ease both; }
        .au-hero-2 { animation: au-hero 0.55s ease 90ms both; }
        .au-hero-3 { animation: au-hero 0.55s ease 180ms both; }
        .au-hero-4 { animation: au-hero 0.55s ease 270ms both; }
      `}</style>

      {/* HERO */}
      <section className="relative pt-28 pb-20 px-5 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(251,146,60,0.07) 0%, transparent 65%)" }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="au-hero-1 inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold rounded-full mb-6 uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            Tentang GrowKM
          </div>

          <h1 className="au-hero-2 text-4xl md:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Kami hadir untuk satu alasan:{" "}
            <span className="text-orange-500">UMKM Indonesia layak tumbuh</span>
          </h1>

          <p className="au-hero-3 text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            GrowKM lahir dari frustrasi melihat jutaan usaha kecil terhambat bukan karena tidak mampu,
            tapi karena tidak punya panduan yang tepat untuk mengurus legalitas.
          </p>

          <div className="au-hero-4 flex flex-wrap justify-center gap-10 text-center">
            {[
              { label: "UMKM Terdampak",     val: 4800, suffix: "+" },
              { label: "Kota Terjangkau",    val: 15,   suffix: "+" },
              { label: "Regulasi Dipetakan", val: 120,  suffix: "+" },
              { label: "Kepuasan Pengguna",  val: 94,   suffix: "%" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-extrabold text-orange-500">
                  <CountUp target={s.val} suffix={s.suffix} />
                </span>
                <span className="text-sm text-gray-400 mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-50 rounded-2xl border border-orange-100" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-amber-50 rounded-xl border border-amber-100" />
                <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-8 md:p-10">
                  <div className="text-5xl md:text-7xl font-extrabold text-orange-500 leading-none mb-3">64</div>
                  <div className="text-base font-semibold text-gray-700 mb-2">juta UMKM di Indonesia</div>
                  <div className="text-sm text-gray-500 leading-relaxed">
                    berkontribusi pada 61% PDB nasional — namun hanya sebagian kecil yang sudah memiliki legalitas lengkap.
                  </div>
                  <div className="mt-6 pt-6 border-t border-orange-200">
                    <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      GrowKM ada untuk mengubah angka itu.
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                  Asal-usul kami
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  Berawal dari pertanyaan sederhana di warung kopi
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Tahun 2023, tim kami turun langsung ke lapangan — berbicara dengan ratusan pemilik warung makan,
                  pengrajin batik, dan penjahit rumahan. Satu keluhan yang selalu muncul:{" "}
                  <em className="text-gray-700 not-italic font-medium">"Mau urus izin, tapi tidak tahu harus mulai dari mana."</em>
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Bukan karena malas. Bukan karena tidak mau formal. Tapi karena informasinya tersebar,
                  bahasanya teknis, dan tidak ada yang menemaninya langkah per langkah.
                </p>
                <p className="text-gray-500 leading-relaxed">GrowKM adalah jawaban kami atas pertanyaan itu.</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                Nilai kami
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Prinsip yang memandu setiap keputusan
              </h2>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeUp key={v.title} delay={i * 60}>
                  <div className="group flex gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm transition-colors duration-200">
                    <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors duration-200">
                      <Icon className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{v.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                Perjalanan kami
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dari riset lapangan ke{" "}
                <span className="text-orange-500">platform nasional</span>
              </h2>
            </div>
          </FadeUp>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <FadeUp key={m.year} delay={i * 60}>
                  <div
                    className="relative flex gap-6 pb-10 cursor-pointer group"
                    onClick={() => setActiveTimeline(activeTimeline === i ? null : i)}
                  >
                    <div className="relative flex-shrink-0 w-12 flex items-start justify-center pt-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                          activeTimeline === i
                            ? "bg-orange-500 border-orange-500 scale-125"
                            : "bg-white border-gray-300 group-hover:border-orange-400"
                        }`}
                        style={{ zIndex: 1 }}
                      />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-150 ${
                        activeTimeline === i ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"
                      }`}>
                        {m.year}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{m.title}</h3>
                      <p
                        className="text-sm text-gray-500 leading-relaxed overflow-hidden"
                        style={{
                          maxHeight: activeTimeline === i ? "80px" : "0px",
                          opacity: activeTimeline === i ? 1 : 0,
                          transition: "max-height 0.35s ease, opacity 0.25s ease",
                        }}
                      >
                        {m.desc}
                      </p>
                      {activeTimeline !== i && (
                        <p className="text-sm text-gray-400">{m.desc.slice(0, 60)}…</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-16 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                Tim kami
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Orang-orang di balik GrowKM</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                Kami adalah tim kecil yang percaya bahwa teknologi bisa membuat sistem yang rumit menjadi mudah dijangkau oleh semua orang.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((t, i) => (
              <FadeUp key={t.name} delay={i * 60}>
                <div className="group text-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm transition-colors duration-200">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold transition-transform duration-200 group-hover:scale-105"
                    style={{ background: t.bg, color: t.color, border: `1.5px solid ${t.color}20` }}
                  >
                    {t.initials}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5">
        <FadeUp>
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-10 text-center">
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgb(249 115 22) 1.5px, transparent 1.5px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div className="relative">
                <Star className="w-8 h-8 text-orange-400 mx-auto mb-4" strokeWidth={1.5} />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Bergabung dalam misi kami</h2>
                <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto mb-8">
                  Bersama-sama, kita bisa membantu jutaan UMKM Indonesia untuk tumbuh dengan pondasi legalitas yang kuat.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200">
                    Mulai Cek Legalitas
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                    <Users className="w-4 h-4" />
                    Hubungi Tim Kami
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}