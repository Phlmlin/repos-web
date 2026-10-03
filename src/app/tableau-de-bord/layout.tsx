import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireTenancier } from "@/lib/auth/roles";
import { SidebarNav } from "./sidebar-nav";

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
            <SidebarNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
