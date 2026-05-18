import { ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";

export default function IndexHero() {
  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Subtle top wash */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />

      {/* ── MOBILE ── */}
      <section className="lg:hidden relative pt-24 pb-14 px-5">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold leading-snug tracking-tight text-gray-900 mb-4">
            Urus legalitas usaha{" "}
            <span className="text-orange-500">
              tanpa bingung,
            </span>{" "}
            tanpa bolak-balik cari informasi
          </h1>

          <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
            Isi profil usaha, dapat rekomendasi KBLI, ikuti roadmap perizinan
            langkah demi langkah, dan temukan peluang bisnis nyata setelah izin
            selesai.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm active:scale-95 transition-all duration-200">
              Cek Legalitas Usaha
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all duration-200">
              Lihat Cara Kerja
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            {[
              "Gratis, tidak perlu kartu kredit",
              "Panduan dari regulasi resmi",
              "Cocok untuk usaha rumahan",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard screenshot */}
        <DashboardFrame />
      </section>

      {/* ── DESKTOP ── */}
      <section className="hidden lg:block relative pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-8 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-14 items-center min-h-[60vh]">
            {/* Left: copy */}
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold leading-snug tracking-tight text-gray-900">
                Urus legalitas usaha{" "}
                <span className="text-orange-500">
                  tanpa bingung,
                </span>{" "}
                tanpa bolak-balik cari informasi
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                Isi profil usaha, dapat rekomendasi KBLI, ikuti roadmap
                perizinan langkah demi langkah, dan temukan peluang bisnis
                nyata setelah izin selesai.
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200">
                  Cek Legalitas Usaha
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-7 py-3.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                  Lihat Cara Kerja
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-400 pt-1">
                {[
                  "Gratis, tidak perlu kartu kredit",
                  "Panduan dari regulasi resmi",
                  "Cocok untuk usaha rumahan",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: dashboard screenshot */}
            <div className="flex items-center justify-end">
              <DashboardFrame />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardFrame() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Browser chrome wrapper */}
      <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200">
        {/* Chrome top bar */}
        <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="ml-3 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400">
            growkm.pages.dev/dashboard
          </div>
        </div>

        {/* Dashboard screenshot */}
        <img
          src="/growkm-dashboard.png"
          alt="Tampilan dashboard GrowKM"
          className="w-full h-auto block"
          loading="eager"
        />
      </div>
    </div>
  );
}
