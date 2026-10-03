import Link from "next/link";
import {
  BedDouble,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

const ROLE_HOME: Record<string, { href: string; label: string; Icon: typeof Ticket }> = {
  client: { href: "/compte", label: "Mes réservations", Icon: Ticket },
  tenancier: { href: "/tableau-de-bord", label: "Tableau de bord", Icon: LayoutDashboard },
  admin: { href: "/admin", label: "Administration", Icon: ShieldCheck },
};

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "client";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }
  const home = ROLE_HOME[role] ?? ROLE_HOME.client;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-pine-800 text-paper">
            <BedDouble className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-pine-950">
            Repos
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <Link href="/catalogue" className="transition hover:text-pine-800">
            Établissements
          </Link>
          <Link href="/#comment-ca-marche" className="transition hover:text-pine-800">
            Comment ça marche
          </Link>
          <Link href="/#tenanciers" className="transition hover:text-pine-800">
            Tenanciers
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <Link
                href="/connexion"
                className="hidden text-sm font-semibold text-pine-800 transition hover:text-pine-950 sm:block"
              >
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-pine-800 px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-900"
              >
                Créer un compte
              </Link>
            </>
          ) : (
            <>
              <Link
                href={home.href}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-pine-800 transition hover:border-pine-600"
              >
                <home.Icon className="size-4" />
                <span className="hidden sm:inline">{home.label}</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  title="Se déconnecter"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-clay-600"
                >
                  <LogOut className="size-4" />
                  <span className="hidden lg:inline">Déconnexion</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
