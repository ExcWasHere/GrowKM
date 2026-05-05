import type { Route } from "./+types/dashboard";
import Dashboard from "~/components/Dashboard/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Dashboard" },
    { name: "description", content: "Welcome to GrowKM!" },
  ];
}

export default function DashboardRoute() {
  return <Dashboard />;
}