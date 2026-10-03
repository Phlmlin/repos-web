import Link from "next/link";
import {
  BellRing,
  Building2,
  CalendarDays,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import {
  getDashboardStats,
  getEstablishmentBookings,
  getMyEstablishments,
} from "@/lib/tenancier/queries";
import { SLOT_LABELS, formatPrice, type SlotType } from "@/lib/repos";

export default async function DashboardPage() {
  const ctx = await requireTenancier();
  const establishments = await getMyEstablishments(ctx);

  if (establishments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center">
        <Building2 className="mx-auto size-10 text-ink-faint" />
        <h2 className="mt-4 font-display text-2xl font-semibold text-pine-950">
          Ajoutez votre établissement
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Créez votre fiche en quelques minutes : description, équipements et
          tarifs par créneau. Vous recevrez vos premières réservations dès sa
          publication.
        </p>
        <Link
          href="/tableau-de-bord/etablissement/nouveau"
          className="mt-6 inline-block rounded-full bg-pine-800 px-8 py-3.5 text-sm font-semibold text-paper transition hover:bg-pine-900"
        >
          Créer ma fiche établissement
        </Link>
      </div>
    );
  }

  const est = establishments[0];
  const stats = await getDashboardStats(ctx, est.id);
  const upcoming = await getEstablishmentBookings(ctx, est.id, {
    upcomingOnly: true,
    limit: 5,
  });

  const cards = [
    {
      Icon: BellRing,
      label: "En attente de confirmation",
      value: String(stats.pending),
      hint: "réservations à traiter",
    },
    {
      Icon: CalendarDays,
      label: "Réservations à venir",
      value: String(stats.upcoming),
      hint: "confirmées et en attente",
    },
    {
      Icon: Wallet,
      label: "Revenus · 30 jours",
      value: formatPrice(stats.revenue30d),
      hint: `${stats.bookings30d} réservation${stats.bookings30d > 1 ? "s" : ""} sur la période`,
    },
    {
      Icon: Star,
      label: "Note moyenne",
      value: stats.avgRating != null ? `${stats.avgRating.toFixed(1)}/5` : "—",
      hint: `${stats.reviewsCount} avis clients`,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-pine-950">
          {est.name}
        </h2>
        <Link
          href="/tableau-de-bord/etablissement"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-pine-600"
        >
          Modifier ma fiche
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ Icon, label, value, hint }) => (
          <div
            key={label}
            className="rounded-3xl border border-line bg-white p-6"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-pine-50 text-pine-700">
              <Icon className="size-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-pine-950">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{label}</p>
            <p className="text-xs text-ink-faint">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-pine-950">
          Prochaines réservations
        </h3>
        <Link
          href="/tableau-de-bord/reservations"
          className="text-sm font-semibold text-pine-700 hover:text-pine-900"
        >
          Tout voir →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-ink-soft">
          Aucune réservation à venir pour le moment.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-ink">
                  {b.guest_name ?? "Client"} ·{" "}
                  <span className="font-mono text-sm">{b.code}</span>
                </p>
                <p className="mt-0.5 text-sm capitalize text-ink-soft">
                  {new Date(`${b.day}T12:00:00`).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {SLOT_LABELS[b.slot_type as SlotType]}
                  {b.arrival_time ? ` · arrivée ${b.arrival_time}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-pine-900">
                  {formatPrice(b.total_fcfa)}
                </span>
                {b.status === "pending" ? (
                  <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-600">
                    À confirmer
                  </span>
                ) : (
                  <span className="rounded-full bg-pine-700/10 px-3 py-1 text-xs font-semibold text-pine-700">
                    Confirmée
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {establishments.length > 1 && (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
          <TrendingUp className="size-4 text-pine-700" />
          Vous gérez {establishments.length} établissements — affichage du
          premier ici.
        </p>
      )}
    </div>
  );
}
