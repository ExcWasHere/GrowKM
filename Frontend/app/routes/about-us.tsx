import type { Route } from "./+types/about-us";
import Navbar from "../common/landingpage/navbar";
import Footer from "../common/landingpage/footer";
import AboutUs from "~/components/LandingPage/about-us";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | About-Us" },
    {
      name: "description",
      content:
        "GrowKM membantu UMKM Indonesia urus legalitas usaha: rekomendasi KBLI, roadmap perizinan, tanya Lexa AI, dan temukan peluang bisnis setelah izin selesai.",
    },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
        <AboutUs />
      <Footer />
    </div>
  );
}
