import type { Route } from "./+types/home";
import Navbar from "../common/landingpage/navbar";
import IndexHero from "../components/LandingPage/introduction";
import Stats from "../components/LandingPage/stats";
import PainPoints from "../components/LandingPage/pain-points";
import Journey from "../components/LandingPage/journey";
import FinalCta from "../components/LandingPage/final-cta";
import Footer from "../common/landingpage/footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Urus Legalitas Usaha Tanpa Bingung" },
    {
      name: "description",
      content:
        "GrowKM membantu UMKM Indonesia urus legalitas usaha: rekomendasi KBLI, roadmap perizinan, tanya Lexa AI, dan temukan peluang bisnis setelah izin selesai.",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <IndexHero />
      <Stats />
      <PainPoints />
      <Journey />
      <FinalCta />
      <Footer />
    </div>
  );
}
