import { useLocation, Link } from "react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {}

const Navbar: React.FC<HeaderProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const currentPage = useLocation();

  const navItems = ["Home", "About-Us", "Support", "Sign-In"];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    const path = currentPage.pathname;
    if (path === "/") {
      setActiveItem("Home");
    } else {
      const matchedItem = navItems.find(
        (item) => path === `/${item.toLowerCase()}`,
      );
      if (matchedItem) setActiveItem(matchedItem);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage.pathname]);

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <li key={item} className="relative group">
          <Link
            to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            className={`py-3 px-4 rounded-lg transition-all duration-300 block transform hover:scale-105 relative overflow-hidden
              ${
                activeItem === item
                  ? "text-amber-700 font-bold"
                  : "text-stone-600 hover:text-amber-700"
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="relative z-10">{item}</span>
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-400 transition-transform duration-300
                ${
                  activeItem === item
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
            />
          </Link>
        </li>
      ))}
    </>
  );

  const MobileNavLinks = () => (
    <>
      {navItems.map((item, index) => (
        <li
          key={item}
          className="px-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Link
            to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            className={`block py-4 px-5 rounded-xl text-center transition-all duration-300 font-semibold
              ${
                activeItem === item
                  ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-lg border border-amber-200"
                  : "text-stone-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 hover:shadow-md"
              }`}
            onClick={() => {
              setActiveItem(item);
              setIsMobileMenuOpen(false);
            }}
          >
            {item}
          </Link>
        </li>
      ))}
    </>
  );

  return (
    <>
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-yellow-50/30 -z-10" />

      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 z-50 w-full h-16 md:h-20 flex justify-between items-center px-4 md:px-10 transition-all duration-500 backdrop-blur-md border-b border-amber-200/60
          ${
            isScrolled || isMobileMenuOpen
              ? "bg-white/95 shadow-xl shadow-amber-100/50"
              : "bg-amber-50/70 shadow-lg shadow-amber-100/30"
          }`}
      >
        {/* Logo */}
        <h1 className="invisible md:visible text-xl md:text-2xl font-bold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
          Grow
          <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            KM
          </span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex gap-2 font-semibold items-center">
            <NavLinks />
          </ul>
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl p-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-amber-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="text-amber-700 rotate-90 transition-transform duration-300" />
          ) : (
            <Menu className="text-amber-700 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Overlay */}
      <button
        className={`fixed inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/10 to-amber-900/20 backdrop-blur-sm z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Close menu overlay"
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed right-0 top-0 w-80 h-full bg-white shadow-2xl shadow-amber-200/60 z-50 transform transition-all duration-700 ease-out rounded-l-3xl border-l border-amber-100
          ${
            isMobileMenuOpen
              ? "translate-x-0 scale-100"
              : "translate-x-full scale-95"
          }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-amber-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            Grow
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              KM
            </span>
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-amber-50 hover:scale-110 transition-all shadow-md border border-amber-100"
          >
            <X className="text-amber-700" />
          </button>
        </div>
        <nav className="py-8 px-2">
          <ul className="flex flex-col gap-3 font-medium">
            <MobileNavLinks />
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;