import { Map, MessageSquare, ShieldCheck, BookOpen } from "lucide-react";
import { createElement, type ReactNode } from "react";

type CardMeta = {
  icon: ReactNode;
  badge: string;
  badgeClass: string;
  iconClass: string;
  desc: string;
  gradientClass: string;
};

export const CARD_META: Record<string, CardMeta> = {
  roadmap: {
    icon: createElement(Map, { size: 20 }),
    badge: "Panduan",
    badgeClass: "bg-amber-100 text-amber-800",
    iconClass: "bg-amber-100 text-amber-700",
    gradientClass: "from-amber-400 to-orange-500",
    desc: "Formalisasi bisnis kamu jadi lebih terstruktur dengan Guide to Grow",
  },
  chat: {
    icon: createElement(MessageSquare, { size: 20 }),
    badge: "AI Copilot",
    badgeClass: "bg-orange-100 text-orange-800",
    iconClass: "bg-orange-100 text-orange-700",
    gradientClass: "from-amber-400 to-orange-500",
    desc: "Bingung urus legalitas? Tanyain aja ke AI Copilot 24/7 buat kamu!",
  },
  scanner: {
    icon: createElement(ShieldCheck, { size: 20 }),
    badge: "Legalitas",
    badgeClass: "bg-yellow-100 text-yellow-800",
    iconClass: "bg-yellow-100 text-yellow-700",
    gradientClass: "from-orange-500 to-red-500",
    desc: "Cek kelengkapan izin dan dokumen usahamu yuk!",
  },
  finance: {
    icon: createElement(BookOpen, { size: 20 }),
    badge: "Keuangan",
    badgeClass: "bg-green-100 text-green-800",
    iconClass: "bg-green-100 text-green-700",
    gradientClass: "from-yellow-400 to-amber-500",
    desc: "Catat & pantau keuangan kamu jadi lebih simple pakai Financial Record",
  },
};