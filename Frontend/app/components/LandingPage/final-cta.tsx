import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="py-14 px-5 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Subtle dot texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgb(249 115 22) 1.5px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative">
            <p className="text-orange-600 text-xs font-semibold uppercase tracking-widest mb-3">
              Satu langkah pertama
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
              Mulai dari Satu Langkah:
              <br />
              Cek Legalitas Usaha Anda
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Isi profil usaha, temukan KBLI yang sesuai, dan lihat izin apa
              yang perlu Anda urus berikutnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-xl shadow-sm hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all duration-200">
                Mulai Cek Legalitas
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200">
                Pelajari Fitur GrowKM
              </button>
            </div>

            <p className="mt-6 text-gray-500 text-xs">
              Gratis · Tidak perlu kartu kredit · Untuk semua UMKM Indonesia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
