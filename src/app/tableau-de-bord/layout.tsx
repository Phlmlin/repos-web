import { Building2, CalendarDays, LayoutDashboard, Star } from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireTenancier();

  return (
    <DashboardShell
      role="tenancier"
      userName={ctx.fullName ?? "Tenancier"}
      userEmail={ctx.email ?? undefined}
      nav={[
        { href: "/tableau-de-bord", label: "Vue d'ensemble", Icon: LayoutDashboard },
        { href: "/tableau-de-bord/reservations", label: "Réservations", Icon: CalendarDays },
        { href: "/tableau-de-bord/avis", label: "Avis", Icon: Star },
        { href: "/tableau-de-bord/etablissement", label: "Mon établissement", Icon: Building2 },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
