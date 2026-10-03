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
        { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: "dashboard" },
        { href: "/tableau-de-bord/reservations", label: "Réservations", icon: "calendar" },
        { href: "/tableau-de-bord/avis", label: "Avis", icon: "star" },
        { href: "/tableau-de-bord/etablissement", label: "Mon établissement", icon: "building" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
