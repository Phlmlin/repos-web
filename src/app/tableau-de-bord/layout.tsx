import Link from "next/link";
import { Building2, CalendarDays, LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireTenancier } from "@/lib/auth/roles";

const NAV = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/tableau-de-bord/reservations", label: "Réservations", Icon: CalendarDays },
  { href: "/tableau-de-bord/etablissement", label: "Mon établissement", Icon: Building2 },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireTenancier();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pine-700">
          Espace tenancier
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-950">
          Bonjour, {ctx.fullName ?? "tenancier"}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <nav className="flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-pine-600 hover:text-pine-800"
                >
                  <Icon className="size-4.5 text-pine-700" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
