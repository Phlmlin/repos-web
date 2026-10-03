import Link from "next/link";
import { BedDouble, Globe, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { DashboardNav, type DashNavItem } from "./nav";

export type DashboardRole = "client" | "tenancier" | "admin";

const ROLE_LABEL: Record<DashboardRole, string> = {
  client: "Espace client",
  tenancier: "Espace tenancier",
  admin: "Administration",
};

/** Coquille SaaS partagée : sidebar sombre + contenu. */
export function DashboardShell({
  role,
  userName,
  userEmail,
  nav,
  children,
}: {
  role: DashboardRole;
  userName: string;
  userEmail?: string;
  nav: DashNavItem[];
  children: React.ReactNode;
}) {
  const initial = (userName || userEmail || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-68 shrink-0 flex-col bg-pine-950 lg:flex">
        <div className="flex items-center gap-3 px-5 pb-6 pt-7">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gold-500 text-pine-950">
              <BedDouble className="size-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-paper">
              Repos
            </span>
          </Link>
        </div>
        <p className="px-8 pb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/40">
          {ROLE_LABEL[role]}
        </p>
        <div className="flex-1 overflow-y-auto pb-4">
          <DashboardNav items={nav} />
        </div>
        <div className="border-t border-white/10 p-4">
          <Link
            href="/catalogue"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-paper/60 transition hover:bg-white/5 hover:text-paper"
          >
            <Globe className="size-4.5 shrink-0 text-paper/40" />
            Voir le site public
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-500/20 font-display text-sm font-semibold text-gold-500">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-paper">
                {userName}
              </p>
              {userEmail && (
                <p className="truncate text-xs text-paper/50">{userEmail}</p>
              )}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Se déconnecter"
                className="grid size-8 place-items-center rounded-lg text-paper/50 transition hover:bg-white/10 hover:text-paper"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Colonne principale */}
      <div className="min-w-0 flex-1">
        {/* Barre mobile */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-pine-800 text-paper">
              <BedDouble className="size-4" strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl font-semibold text-pine-950">
              Repos
            </span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {ROLE_LABEL[role]}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              title="Se déconnecter"
              className="grid size-9 place-items-center rounded-xl border border-line text-ink-soft"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </header>
        <div className="border-b border-line bg-paper lg:hidden">
          <DashboardNav items={nav} orientation="horizontal" />
        </div>

        <main className="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
