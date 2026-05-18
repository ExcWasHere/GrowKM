export default function Stats() {
  const stats = [
    {
      number: "99%",
      label: "unit usaha di Indonesia adalah UMKM",
      highlight: false,
    },
    {
      number: "60%+",
      label: "kontribusi UMKM terhadap PDB nasional",
      highlight: false,
    },
    {
      number: "97%",
      label: "tenaga kerja nasional diserap sektor UMKM",
      highlight: false,
    },
    {
      number: "1,22%",
      label: "UMKM non-pertanian yang sudah punya NIB",
      highlight: true,
    },
  ];

  return (
    <section className="py-14 px-5 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            UMKM Besar Perannya,{" "}
            <span className="text-orange-500">
              Tapi Banyak yang Belum Formal
            </span>
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
            Legalitas bukan sekadar syarat administrasi — ini kunci untuk akses
            modal, pasar, dan peluang bisnis yang lebih besar.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 shadow-sm"
            >
              <p className="text-3xl md:text-4xl font-extrabold mb-2 text-orange-500">
                {stat.number}
              </p>
              <p className="text-sm leading-snug text-gray-500">
                {stat.label}
              </p>
              {stat.highlight && (
                <p className="mt-2 text-xs text-orange-500 font-medium italic">
                  Masih sangat sedikit
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Dengan NIB dan izin yang lengkap, UMKM bisa mengakses KUR, berjualan
          di marketplace resmi, mengikuti tender pemerintah, dan mendapat
          kepercayaan dari mitra bisnis.
        </p>
      </div>
    </section>
  );
}
