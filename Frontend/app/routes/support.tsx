import type { Route } from "./+types/support";
import Navbar from "../common/landingpage/navbar";
import Footer from "../common/landingpage/footer";
import SupportPage from "~/components/LandingPage/support";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Support" },
    {
      name: "description",
      content:
        "GrowKM membantu UMKM Indonesia urus legalitas usaha: rekomendasi KBLI, roadmap perizinan, tanya Lexa AI, dan temukan peluang bisnis setelah izin selesai.",
    },
  ];
}

export default function Support() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
        <SupportPage />
      <Footer />
    </div>
  );
}
