import { Link } from "react-router";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-500 pt-14 pb-8 px-5 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              GrowKM
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
              Membantu UMKM Indonesia memahami dan mengurus legalitas usaha
              mulai dari KBLI, perizinan, hingga peluang bisnis yang terbuka
              setelah izin selesai.
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">support@growkm.id</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">Indonesia</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-gray-700 text-sm font-semibold mb-4">Produk</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Smart KBLI Matcher", href: "/" },
                { label: "Guide to Grow", href: "/" },
                { label: "Lexa AI", href: "/" },
                { label: "MarketGate", href: "/" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-700 text-sm font-semibold mb-4">
              Dukungan
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Tentang GrowKM", href: "/about-us" },
                { label: "Bantuan", href: "/support" },
                { label: "Hubungi Kami", href: "/support" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-7 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-300">
            © {currentYear} GrowKM. Dibuat untuk UMKM Indonesia.
          </p>
          <div className="flex gap-5">
            <Link
              to="/privacy"
              className="text-xs text-gray-300 hover:text-orange-500 transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              to="/terms"
              className="text-xs text-gray-300 hover:text-orange-500 transition-colors"
            >
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
