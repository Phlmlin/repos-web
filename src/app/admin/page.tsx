import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireAdmin } from "@/lib/auth/roles";
import { SLOT_LABELS, formatPrice, type SlotType } from "@/lib/repos";

export default async function AdminPage() {
  const ctx = await requireAdmin();
  const sb = ctx.supabase;

  const [{ count: users }, { count: establishments }, { data: bookings }] =
    await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("establishments").select("id", { count: "exact", head: true }),
      sb
        .from("bookings")
        .select("id,code,day,slot_type,total_fcfa,status,establishments(name)")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

  const revenue = ((await sb
    .from("bookings")
    .select("total_fcfa")
    .in("status", ["confirmed", "completed"])) as {
    data: Array<{ total_fcfa: number }> | null;
  }).data?.reduce((s, b) => s + b.total_fcfa, 0);

  const cards = [
    { Icon: Users, label: "Utilisateurs", value: String(users ?? 0) },
    { Icon: BedDouble, label: "Établissements", value: String(establishments ?? 0) },
    {
      Icon: Wallet,
      label: "Revenus plateforme",
      value: formatPrice(revenue ?? 0),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-pine-700">
          <ShieldCheck className="size-4" /> Administration
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-pine-950">
          Vue d'ensemble
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-3xl border border-line bg-white p-6">
              <span className="grid size-10 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 font-display text-3xl font-semibold text-pine-950">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-soft">{label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 flex items-center gap-2 font-display text-2xl font-semibold text-pine-950">
          <CalendarDays className="size-5 text-pine-700" />
          Dernières réservations
        </h2>
        <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-white">
          {((bookings ?? []) as Array<Record<string, unknown>>).map((b, i) => {
            const est = b.establishments as unknown as { name: string } | null;
            return (
              <div
                key={String(b.id)}
                className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-ink">
                    {est?.name ?? "—"}{" "}
                    <span className="font-mono text-sm font-normal text-ink-soft">
                      {String(b.code)}
                    </span>
                  </p>
                  <p className="text-sm capitalize text-ink-soft">
                    {new Date(`${String(b.day)}T12:00:00`).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "short" },
                    )}{" "}
                    · {SLOT_LABELS[String(b.slot_type) as SlotType]} ·{" "}
                    {String(b.status)}
                  </p>
                </div>
                <p className="font-display font-semibold text-pine-900">
                  {formatPrice(Number(b.total_fcfa))}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-ink-soft">
          Gestion avancée (modération des avis, retraits tenanciers, rôles) :
          via le dashboard Supabase en attendant la prochaine itération.
        </p>
        <Link
          href="/compte"
          className="mt-4 inline-block text-sm font-semibold text-pine-700 hover:text-pine-900"
        >
          ← Retour à mon compte
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
