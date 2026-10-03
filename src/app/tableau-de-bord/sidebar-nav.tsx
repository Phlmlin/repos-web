"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, LayoutDashboard, Star } from "lucide-react";

const NAV = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", Icon: LayoutDashboard },
  {
    href: "/tableau-de-bord/reservations",
    label: "Réservations",
    Icon: CalendarDays,
  },
  { href: "/tableau-de-bord/avis", label: "Avis", Icon: Star },
  {
    href: "/tableau-de-bord/etablissement",
    label: "Mon établissement",
    Icon: Building2,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
      {NAV.map(({ href, label, Icon }) => {
        const active =
          href === "/tableau-de-bord"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-pine-800 bg-pine-800 text-paper shadow-sm"
                : "border-line bg-white text-ink hover:border-pine-600 hover:text-pine-800"
            }`}
          >
            <Icon
              className={`size-4.5 ${active ? "text-paper" : "text-pine-700"}`}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
