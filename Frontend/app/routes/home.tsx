import type { Route } from "./+types/home";
import Navbar from "../common/landingpage/navbar";
import IndexHero from "../components/LandingPage/introduction";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Home" },
    { name: "Home", content: "Welcome to Arsana!" },
  ];
}

export default function Home() {
  return (
    <div>
      <Navbar />
      <IndexHero />
    </div>
  );
}