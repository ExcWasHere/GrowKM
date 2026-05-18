import { HelpCircle, FileX, BookOpen, TrendingUp } from "lucide-react";

export default function PainPoints() {
  const pains = [
    {
      icon: HelpCircle,
      title: "Bingung pilih KBLI",
      description:
        "KBLI punya ribuan kode. Salah pilih bisa bikin izin ditolak atau usaha tidak sesuai klasifikasi resmi.",
    },
    {
      icon: FileX,
      title: "Tidak tahu izin apa setelah NIB",
      description:
        "NIB hanya awal. Usaha kuliner perlu PIRT, usaha kosmetik perlu izin edar — banyak yang tidak tahu harus kemana.",
    },
    {
      icon: BookOpen,
      title: "Informasi tersebar dan susah dipahami",
      description:
        "Regulasi ada di banyak sumber berbeda. Bahasanya teknis, tidak ada yang merangkumnya secara sederhana dan kontekstual.",
    },
    {
      icon: TrendingUp,
      title: "Legalitas belum terhubung ke peluang nyata",
      description:
        "Banyak yang sudah urus izin tapi tidak tahu bahwa NIB bisa membuka akses KUR, marketplace, atau program pemerintah.",
    },
  ];

  return (
    <section className="py-14 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Kenapa Banyak UMKM{" "}
            <span className="text-orange-500">Masih Tertahan?</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl leading-relaxed">
            Bukan karena tidak mau formal, tapi karena prosesnya tidak jelas
            dan membingungkan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {pains.map((pain, index) => {
            const Icon = pain.icon;
            return (
              <div
                key={index}
                className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon
                    className="w-5 h-5 text-orange-500"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {pain.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {pain.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
