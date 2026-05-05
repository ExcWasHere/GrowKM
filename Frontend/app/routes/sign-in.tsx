import type { Route } from "./+types/sign-in";
import LoginPage from "~/components/Auth/sign-in";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Sign-in" },
    { name: "Sign-in", content: "Welcome to GrowKM!" },
  ];
}

export default function Signin() {
  return (
    <>
    <LoginPage />
    </>
  );
}