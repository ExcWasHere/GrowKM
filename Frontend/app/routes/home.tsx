import type { Route } from "./+types/home";
import Navbar from "../common/landing/navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arsana | Home" },
    { name: "Home", content: "Welcome to Arsana!" },
  ];
}

export default function Home() {
  return (
    <div>
      <Navbar />
    </div>
  );
}