export default function IndexHero() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* MOBILE VIEW */}
      <section className="lg:hidden pt-28 pb-20 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
          <span className="text-gray-900">Hai Kenalin!</span>
          <br />
          <span className="text-gray-900">Aku </span>
          <span className="inline-block font-bold growkmText">GrowKM</span>
        </h1>

        <p className="mt-6 text-xl leading-relaxed italic text-gray-700">
          Platform UMKM Digital
          <br />
          Untuk Bantu Grow-in Bisnis Kamu!
        </p>

        <div className="mt-10 flex justify-center">
          <button className="px-10 py-5 bg-linear-to-r from-amber-400 to-amber-400 text-white font-bold rounded-full shadow-lg active:scale-95 transition">
            Kepoin GrowKM Yuk!
          </button>
        </div>

        <div className="mt-14 flex justify-center">
          <img
            src="/favicon.ico"
            alt="Ilustrasi Utama GrowKM"
            className="w-full max-w-sm object-contain"
          />
        </div>
      </section>

      {/* DESKTOP VIEW */}
      <section
        className="hidden lg:block pt-32 pb-16"
        style={{ minHeight: "90vh" }}
      >
        <div className="relative max-w-360 mx-auto px-8 md:px-16 lg:px-24 xl:px-32 h-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
            {/* TEXT */}
            <div className="flex flex-col justify-center space-y-8">
              <h1 className="text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">Hai Kenalin!</span>
                <br />
                <span className="text-gray-900">Aku </span>
                <span className="inline-block font-bold growkmText">
                  GrowKM
                </span>
              </h1>

              <p className="text-gray-700 text-2xl leading-relaxed max-w-lg font-light italic">
                Platform UMKM Digital
                <br />
                Untuk Bantu Grow-in Bisnis Kamu!
              </p>

              <div>
                <button className="px-12 py-5 bg-linear-to-r from-amber-400 to-amber-400 text-white font-bold rounded-full shadow-lg hover:shadow-amber-200/50 transform hover:scale-105 transition-all duration-300">
                  Kepoin GrowKM Yuk!
                </button>
              </div>
            </div>

            {/* IMAGE */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                <div className="relative p-10 rounded-3xl overflow-hidden">
                  <img
                    src="/banner1.png"
                    alt="Ilustrasi Utama GrowKM"
                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-60 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STYLE */}
      <style>{`
  .growkmText {
    opacity: 0;
    background-image: linear-gradient(
      to right,
      #F59E0B,
      #EA580C,
      #EF9F27,
      #F59E0B
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeIn 1.8s ease-out forwards,
      gradientFlowContinuous 3s linear 1.8s infinite;
  }

  @keyframes fadeIn {
    0% { opacity: 0; background-position: 0% center; }
    100% { opacity: 1; background-position: 100% center; }
  }

  @keyframes gradientFlowContinuous {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`}</style>
    </div>
  );
}