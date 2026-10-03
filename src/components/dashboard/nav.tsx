"use client";

import Link from "next/link";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface DashNavItem {
  href: string;
  label: string;
  /** Nom d'icone : les composants (fonctions) ne peuvent pas transiter vers le client. */
  icon: string;
}

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  users: Users,
  bed: BedDouble,
  calendar: CalendarDays,
  star: Star,
  building: Building2,
};

const SECTION_ROOTS = ["/tableau-de-bord", "/admin", "/compte"];

function isActive(pathname: string, hash: string, href: string): boolean {
  const [path, h] = href.split("#");
  if (h != null) return pathname === path && hash === `#${h}`;
  if (pathname === path) return hash === "";
  if (SECTION_ROOTS.includes(path)) return false;
  return pathname.startsWith(`${path}/`);
}

export function DashboardNav({
  items,
  orientation = "vertical",
}: {
  items: DashNavItem[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const onClick = (href: string) => {
    const [, h] = href.split("#");
    setHash(h != null ? `#${h}` : "");
  };

  if (orientation === "horizontal") {
    return (
      <nav className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Navigation">
        {items.map(({ href, label, icon }) => {
          const Icon = ICONS[icon] ?? LayoutDashboard;
          const active = isActive(pathname, hash, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onClick(href)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-pine-800 text-paper"
                  : "border border-line bg-white text-ink-soft"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Navigation">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon] ?? LayoutDashboard;
        const active = isActive(pathname, hash, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onClick(href)}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-paper/10 text-paper"
                : "text-paper/60 hover:bg-white/5 hover:text-paper"
            }`}
          >
            <Icon
              className={`size-4.5 shrink-0 transition ${
                active ? "text-gold-500" : "text-paper/40 group-hover:text-paper/70"
              }`}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
