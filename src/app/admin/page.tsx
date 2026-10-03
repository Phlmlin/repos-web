import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  Flag,
  Inbox,
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/roles";
import { DashboardShell } from "@/components/dashboard/shell";
import {
  SLOT_LABELS,
  TYPE_LABELS,
  formatPrice,
  type EstablishmentType,
  type SlotType,
} from "@/lib/repos";
import { RoleSelect } from "./role-select";
import {
  FlaggedReviewButtons,
  ValidateEstablishmentButton,
} from "./moderation-buttons";

export default async function AdminPage() {
  const ctx = await requireAdmin();
  const sb = ctx.supabase;

  const [
    { count: users },
    { count: establishments },
    { data: bookings },
    { data: members },
    { data: pendingEsts },
    { data: flagged },
    { data: allEsts },
    { count: pendingBookings },
    { count: bookingsCount },
  ] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("establishments").select("id", { count: "exact", head: true }),
    sb
      .from("bookings")
      .select("id,code,day,slot_type,total_fcfa,status,establishments(name)")
      .order("created_at", { ascending: false })
      .limit(10),
    sb
      .from("profiles")
      .select("id,full_name,role,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    sb
      .from("establishments")
      .select("id,name,type,city,is_active,created_at")
      .eq("is_active", false)
      .order("created_at", { ascending: false })
      .limit(10),
    sb
      .from("reviews")
      .select("id,rating,title,comment,created_at,establishments(name)")
      .eq("is_flagged", true)
      .order("created_at", { ascending: false })
      .limit(10),
    sb.from("establishments").select("type"),
    sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    sb.from("bookings").select("id", { count: "exact", head: true }),
  ]);

  const revenue = (
    (await sb.from("bookings").select("total_fcfa").in("status", [
      "confirmed",
      "completed",
    ])) as { data: Array<{ total_fcfa: number }> | null }
  ).data?.reduce((s, b) => s + b.total_fcfa, 0);

  const typeCounts = new Map<EstablishmentType, number>();
  for (const e of (allEsts ?? []) as Array<{ type: EstablishmentType }>) {
    typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
  }
  const totalEsts = [...typeCounts.values()].reduce((s, n) => s + n, 0);

  const cards = [
    { Icon: Wallet, label: "Chiffre d'affaires", value: formatPrice(revenue ?? 0) },
    { Icon: CalendarDays, label: "Réservations", value: String(bookingsCount ?? 0) },
    { Icon: BedDouble, label: "Établissements", value: String(establishments ?? 0) },
    { Icon: Users, label: "Utilisateurs", value: String(users ?? 0) },
  ];

  return (
    <DashboardShell
      role="admin"
      userName={ctx.fullName ?? "Admin"}
      userEmail={ctx.email ?? undefined}
      nav={[
        { href: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard },
        { href: "/admin#a-traiter", label: "À traiter", Icon: Inbox },
        { href: "/admin#utilisateurs", label: "Utilisateurs", Icon: Users },
      ]}
    >
      <div id="top">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-pine-700">
          <ShieldCheck className="size-4" /> Administration
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-950 sm:text-4xl">
          Pilotage de la plateforme
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Vue globale des opérations, validations et règles commerciales.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* À traiter */}
        <h2 id="a-traiter" className="mt-10 flex scroll-mt-24 items-center gap-2 font-display text-2xl font-semibold text-pine-950">
          <Inbox className="size-5 text-pine-700" />
          À traiter
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-line bg-white p-6">
            <p className="font-display text-3xl font-semibold text-pine-950">
              {(pendingEsts ?? []).length}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              Établissements en validation
            </p>
            {(pendingEsts ?? []).length > 0 && (
              <ul className="mt-4 space-y-3">
                {((pendingEsts ?? []) as Array<Record<string, unknown>>).map(
                  (e) => (
                    <li
                      key={String(e.id)}
                      className="flex items-center justify-between gap-2 border-t border-line pt-3 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {String(e.name)}
                        <span className="block text-xs font-normal text-ink-faint">
                          {TYPE_LABELS[String(e.type) as EstablishmentType]} ·{" "}
                          {String(e.city)}
                        </span>
                      </span>
                      <ValidateEstablishmentButton
                        establishmentId={String(e.id)}
                        active={false}
                      />
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <p className="font-display text-3xl font-semibold text-pine-950">
              {(flagged ?? []).length}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">Avis signalés</p>
            {(flagged ?? []).length > 0 && (
              <ul className="mt-4 space-y-4">
                {((flagged ?? []) as Array<Record<string, unknown>>).map(
                  (r) => {
                    const est = r.establishments as unknown as {
                      name: string;
                    } | null;
                    return (
                      <li key={String(r.id)} className="border-t border-line pt-3">
                        <p className="text-sm font-medium text-ink">
                          {String(r.title ?? "Sans titre")}{" "}
                          <span className="text-xs font-normal text-ink-faint">
                            · {est?.name} · {String(r.rating)}/5
                          </span>
                        </p>
                        {!!r.comment && (
                          <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                            {String(r.comment)}
                          </p>
                        )}
                        <div className="mt-2">
                          <FlaggedReviewButtons reviewId={String(r.id)} />
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <p className="font-display text-3xl font-semibold text-pine-950">
              {pendingBookings ?? 0}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              Réservations en attente
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              Les tenanciers confirment leurs réservations depuis leur tableau
              de bord. Relancez ceux qui tardent à répondre.
            </p>
          </div>
        </div>

        {/* Répartition */}
        {totalEsts > 0 && (
          <>
            <h2 className="mt-10 flex items-center gap-2 font-display text-2xl font-semibold text-pine-950">
              <PieChart className="size-5 text-pine-700" />
              Répartition des établissements
            </h2>
            <div className="mt-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
              <div className="space-y-4">
                {(
                  Object.keys(TYPE_LABELS) as EstablishmentType[]
                ).map((t) => {
                  const n = typeCounts.get(t) ?? 0;
                  const pct = Math.round((n / totalEsts) * 100);
                  return (
                    <div key={t}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-ink">
                          {TYPE_LABELS[t]}
                        </span>
                        <span className="text-ink-soft">
                          {n} · {pct} %
                        </span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-paper">
                        <div
                          className="h-full rounded-full bg-pine-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Utilisateurs & rôles */}
        <h2 id="utilisateurs" className="mt-10 flex scroll-mt-24 items-center gap-2 font-display text-2xl font-semibold text-pine-950">
          <Users className="size-5 text-pine-700" />
          Utilisateurs & rôles
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Changez le rôle d'un membre depuis la liste — effet immédiat à sa
          prochaine connexion.
        </p>
        <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-white">
          {((members ?? []) as Array<Record<string, unknown>>).map((m, i) => (
            <div
              key={String(m.id)}
              className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-ink">
                  {String(m.full_name ?? "—")}
                </p>
                <p className="text-sm text-ink-soft">
                  Membre depuis le{" "}
                  {new Date(String(m.created_at)).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <RoleSelect
                userId={String(m.id)}
                currentRole={String(m.role)}
                disabled={String(m.id) === ctx.userId}
              />
            </div>
          ))}
        </div>

        {/* Dernières réservations */}
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

        <p className="mt-8 flex items-center gap-2 text-sm text-ink-soft">
          <Flag className="size-4 text-pine-700" />
          Modération avancée et retraits tenanciers : via le dashboard Supabase
          en attendant la prochaine itération.
        </p>
        <Link
          href="/compte"
          className="mt-4 inline-block text-sm font-semibold text-pine-700 hover:text-pine-900"
        >
          ← Retour à mon compte
        </Link>
      </div>
    </DashboardShell>
  );
}
