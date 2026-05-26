"use client";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquare, FileText, Search, ChevronDown,
  ArrowRight, Mail, BookOpen, HelpCircle, CheckCircle2,
  AlertCircle, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const useInView = (threshold = 0.1): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeUp = ({ children, delay = 0, className = "" }: FadeUpProps) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

interface AccordionItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem = ({ q, a, isOpen, onClick }: AccordionItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isOpen ? "border-orange-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left"
      >
        <span
          className={`text-sm font-semibold transition-colors duration-200 ${
            isOpen ? "text-orange-600" : "text-gray-800"
          }`}
        >
          {q}
        </span>
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-orange-100 rotate-180" : "bg-gray-100"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors duration-200 ${
              isOpen ? "text-orange-500" : "text-gray-500"
            }`}
          />
        </div>
      </button>
      <div
        style={{
          height,
          overflow: "hidden",
          transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div ref={contentRef}>
          <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  category: string;
  items: FaqItem[];
}

const faqs: FaqSection[] = [
  {
    category: "Umum",
    items: [
      {
        q: "Apa itu GrowKM?",
        a: "GrowKM adalah platform legalitas usaha untuk UMKM Indonesia. Kami membantu Anda menemukan kode KBLI yang tepat, mendapatkan roadmap perizinan yang disesuaikan, dan menemukan peluang bisnis setelah izin selesai.",
      },
      {
        q: "Apakah GrowKM gratis?",
        a: "Ya! GrowKM tersedia secara gratis untuk semua pelaku UMKM Indonesia. Tidak perlu kartu kredit, tidak ada biaya tersembunyi. Fitur premium akan tersedia ke depannya untuk kebutuhan yang lebih kompleks.",
      },
      {
        q: "Siapa yang cocok menggunakan GrowKM?",
        a: "GrowKM dirancang untuk pelaku UMKM di bidang kuliner & makanan, fashion & kerajinan, serta jasa perorangan. Cocok untuk usaha rumahan, warung, atau bisnis kecil yang ingin mulai mengurus legalitas.",
      },
    ],
  },
  {
    category: "Fitur & Penggunaan",
    items: [
      {
        q: "Apa itu KBLI dan kenapa penting?",
        a: "KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) adalah kode yang mengklasifikasikan jenis kegiatan usaha Anda. Kode ini wajib ada saat membuat NIB (Nomor Induk Berusaha) di OSS. Salah kode KBLI bisa menyebabkan izin ditolak atau usaha tidak sesuai klasifikasi resmi.",
      },
      {
        q: "Bagaimana cara kerja Lexa AI?",
        a: "Lexa adalah asisten AI GrowKM yang dilatih dengan regulasi resmi pemerintah Indonesia. Anda bisa bertanya tentang syarat izin, prosedur pendaftaran, atau lembaga yang berwenang dalam bahasa sehari-hari. Lexa akan menjawab dengan bahasa yang mudah dipahami.",
      },
      {
        q: "Apakah panduan GrowKM selalu diperbarui?",
        a: "Ya. Tim kami secara aktif memantau perubahan regulasi dari OSS, BPOM, Kemenkes, dan lembaga terkait lainnya. Ketika ada perubahan kebijakan yang berdampak pada pengguna, kami akan memberikan notifikasi.",
      },
    ],
  },
  {
    category: "Legalitas & Perizinan",
    items: [
      {
        q: "Dari mana sumber regulasi di GrowKM?",
        a: "Semua panduan kami bersumber dari regulasi resmi pemerintah: OSS RBA, Peraturan Menteri terkait, PP dan Perpres, serta sumber resmi dari BPOM, Kemenkes, dan DJKI (untuk merek). Kami mencantumkan referensi regulasi di setiap panduan.",
      },
      {
        q: "GrowKM bisa membantu urus izin saya?",
        a: "GrowKM memberikan panduan dan roadmap perizinan, bukan jasa pengurusan izin. Anda tetap perlu mengurus izin sendiri melalui OSS atau lembaga terkait. Namun, dengan panduan GrowKM, prosesnya menjadi jauh lebih jelas dan terarah.",
      },
      {
        q: "Apa itu MarketGate?",
        a: "MarketGate adalah fitur di GrowKM yang menunjukkan peluang bisnis yang terbuka setelah izin Anda selesai, seperti akses KUR (Kredit Usaha Rakyat), berjualan di marketplace resmi (Tokopedia, Shopee), mengikuti pameran UMKM, tender pemerintah, dan menjadi vendor korporat.",
      },
    ],
  },
];

interface ContactOption {
  icon: LucideIcon;
  title: string;
  desc: string;
  action: string;
  badge: string | null;
  detail: string;
}

const contactOptions: ContactOption[] = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    desc: "Bicara langsung dengan tim kami.",
    action: "Mulai Chat",
    badge: "Paling Cepat",
    detail: "Respons dalam < 2 jam",
  },
  {
    icon: Mail,
    title: "Email",
    desc: "Kirim pertanyaan detail ke tim kami.",
    action: "Kirim Email",
    badge: null,
    detail: "hello@growkm.id",
  },
  {
    icon: BookOpen,
    title: "Dokumentasi",
    desc: "Panduan lengkap penggunaan GrowKM.",
    action: "Buka Docs",
    badge: null,
    detail: "docs.growkm.id",
  },
];

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });

  const allCategories = ["Semua", ...faqs.map((f) => f.category)];

  const filteredFaqs = faqs
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const matchSearch =
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === "Semua" || section.category === activeCategory;
        return matchSearch && matchCat;
      }),
    }))
    .filter((s) => s.items.length > 0);

  const toggle = (key: string) =>
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-white min-h-screen">

      {/* HERO */}
      <section className="relative pt-28 pb-16 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(251,146,60,0.07) 0%, transparent 60%)" }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <div
            style={{ animation: "fadeIn 0.6s ease both" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold rounded-full mb-5 uppercase tracking-wider"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Pusat Bantuan GrowKM
          </div>

          <h1
            style={{ animation: "fadeIn 0.6s ease 80ms both" }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight"
          >
            Ada yang bisa kami bantu?
          </h1>

          <p
            style={{ animation: "fadeIn 0.6s ease 160ms both" }}
            className="text-gray-500 text-lg leading-relaxed mb-8"
          >
            Temukan jawaban atas pertanyaan Anda tentang GrowKM, legalitas usaha, dan cara menggunakan platform kami.
          </p>

          {/* Search bar */}
          <div style={{ animation: "fadeIn 0.6s ease 240ms both" }} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan, misalnya 'cara daftar NIB'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick links */}
          <div style={{ animation: "fadeIn 0.6s ease 320ms both" }} className="mt-5 flex flex-wrap justify-center gap-2">
            {["Cara daftar NIB", "Apa itu KBLI?", "Syarat PIRT", "Akses KUR"].map((q) => (
              <button
                key={q}
                onClick={() => setSearch(q)}
                className="text-xs px-3.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-500 rounded-full transition-colors duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="px-5 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-3">
            {contactOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <FadeUp key={opt.title} delay={i * 70}>
                  <div className="group relative flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm transition-all duration-300">
                    {opt.badge && (
                      <span className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold">
                        {opt.badge}
                      </span>
                    )}
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-0.5">{opt.title}</div>
                      <div className="text-xs text-gray-500 mb-1">{opt.desc}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {opt.detail}
                      </div>
                    </div>
                    <button className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                      {opt.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-5 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                Pertanyaan Umum
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Pertanyaan yang sering ditanyakan
              </h2>
            </div>
          </FadeUp>

          {/* Category filter */}
          <FadeUp delay={60}>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeUp>

          {filteredFaqs.length === 0 ? (
            <FadeUp>
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Tidak ada hasil untuk &quot;{search}&quot;</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs text-orange-500 hover:underline"
                >
                  Hapus pencarian
                </button>
              </div>
            </FadeUp>
          ) : (
            filteredFaqs.map((section) => (
              <FadeUp key={section.category} delay={80}>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-500 px-2.5 py-1 bg-orange-50 rounded-full">
                      {section.category}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, j) => {
                      const key = `${section.category}-${j}`;
                      return (
                        <AccordionItem
                          key={key}
                          q={item.q}
                          a={item.a}
                          isOpen={!!openItems[key]}
                          onClick={() => toggle(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              </FadeUp>
            ))
          )}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                Tidak menemukan jawaban?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Hubungi tim kami</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Jelaskan situasi usaha Anda dan pertanyaan Anda. Tim kami akan merespons dalam 1–2 hari kerja.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={80}>
            {submitted ? (
              <div className="text-center py-16 px-8 bg-orange-50 rounded-2xl border border-orange-200">
                <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pesan terkirim!</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Terima kasih, <strong>{form.name}</strong>. Tim kami akan menghubungi{" "}
                  <strong>{form.email}</strong> dalam 1–2 hari kerja.
                </p>
                <button
                  onClick={resetForm}
                  className="text-xs px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Kirim pesan lagi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Anda</label>
                    <input
                      type="text"
                      required
                      placeholder="Budi Santoso"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="budi@usaha.id"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Pertanyaan atau kendala Anda
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Ceritakan usaha Anda dan apa yang ingin Anda tanyakan..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                    Kami merespons dalam 1–2 hari kerja
                  </p>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm"
                  >
                    Kirim Pesan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </FadeUp>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}