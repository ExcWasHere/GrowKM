import { User, Search, Map, MessageSquare, Store, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: User,
    title: "Isi Profil Usaha",
    description:
      "Ceritakan kondisi usaha Anda: jenis usaha, lokasi, omzet, jumlah pekerja, dan izin yang sudah dimiliki.",
  },
  {
    number: "02",
    icon: Search,
    title: "Smart KBLI Matcher",
    description:
      "GrowKM merekomendasikan kode KBLI yang paling sesuai berdasarkan deskripsi aktivitas bisnis nyata Anda.",
  },
  {
    number: "03",
    icon: Map,
    title: "Roadmap Legalitas",
    description:
      "Dapatkan panduan perizinan yang disesuaikan per sektor — dari NIB, PIRT, Halal, hingga pendaftaran merek.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Lexa AI",
    description:
      "Tanya Lexa tentang syarat, prosedur, dan lembaga yang berwenang — dalam bahasa sederhana, berbasis regulasi resmi.",
  },
  {
    number: "05",
    icon: Store,
    title: "MarketGate",
    description:
      "Temukan peluang yang terbuka setelah izin selesai: KUR, marketplace, program pemerintah, pameran, dan vendor.",
  },
];

export default function Journey() {
  return (
    <section className="py-14 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
            Cara kerja GrowKM
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Dari Profil Usaha ke{" "}
            <span className="text-orange-500">Peluang Bisnis Nyata</span>
          </h2>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            Lima langkah untuk membawa UMKM dari kondisi informal ke formal,
            dirancang untuk{" "}
            <span className="text-gray-700 font-medium">
              kuliner & makanan, fashion & kerajinan, serta jasa perorangan
            </span>
            .
          </p>
        </div>

        {/* Steps grid — 2-col on md+, last item spans full if odd */}
        <div className="grid md:grid-cols-2 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isUnlockMarket = step.number === "05";

            return (
              <div
                key={step.number}
                className={`flex gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                  isUnlockMarket
                    ? "bg-orange-500 border-orange-500 md:col-span-2"
                    : "bg-gray-50 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                } ${isLast && !isUnlockMarket ? "md:col-span-2" : ""}`}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isUnlockMarket
                        ? "bg-white/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isUnlockMarket
                          ? "text-white"
                          : "text-orange-500"
                      }`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isUnlockMarket
                        ? "text-orange-100"
                        : "text-gray-400"
                    }`}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base font-semibold mb-1 ${
                      isUnlockMarket
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isUnlockMarket
                        ? "text-orange-50/90"
                        : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* UnlockMarket tags */}
                  {isUnlockMarket && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {[
                        "KUR BRI/BNI",
                        "Tokopedia · Shopee",
                        "Pameran UMKM",
                        "Tender Pemerintah",
                        "Vendor Korporat",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 bg-white/20 text-white rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200">
            Mulai Cek Legalitas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
