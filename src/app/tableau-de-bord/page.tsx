import Link from "next/link";
import {
  BellRing,
  Building2,
  CalendarDays,
  Star,
  Wallet,
} from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import {
  getDailyCounts,
  getDashboardStats,
  getEstablishmentBookings,
  getMonthStats,
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
  const [stats, month, daily, upcoming] = await Promise.all([
    getDashboardStats(ctx, est.id),
    getMonthStats(ctx, est.id),
    getDailyCounts(ctx, est.id, 7),
    getEstablishmentBookings(ctx, est.id, { upcomingOnly: true, limit: 8 }),
  ]);

  const maxDay = Math.max(1, ...daily.map((d) => d.count));
  const bestDay = daily.reduce((a, b) => (b.count > a.count ? b : a), daily[0]);

  const cards = [
    {
      Icon: Wallet,
      label: "Revenus du mois",
      value: formatPrice(month.revenue),
      hint: `${month.bookings} réservation${month.bookings > 1 ? "s" : ""} ce mois-ci`,
    },
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
      Icon: Star,
      label: "Note moyenne",
      value: stats.avgRating != null ? `${stats.avgRating.toFixed(1)} / 5` : "—",
      hint: `${stats.reviewsCount} avis clients`,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-pine-950">
            {est.name}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Voici vos réservations, vos revenus et vos avis en un coup d'œil.
          </p>
        </div>
        <Link
          href="/tableau-de-bord/etablissement"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-pine-600"
        >
          Modifier ma fiche
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ Icon, label, value, hint }) => (
          <div key={label} className="rounded-3xl border border-line bg-white p-6">
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

      {/* Activité 7 jours */}
      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl font-semibold text-pine-950">
            Réservations des 7 derniers jours
          </h3>
        </div>
        <div className="mt-6 flex items-end gap-2 sm:gap-3" aria-hidden>
          {daily.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-pine-800">
                {d.count > 0 ? d.count : ""}
              </span>
              <div className="flex h-28 w-full items-end rounded-xl bg-paper">
                <div
                  className={`w-full rounded-xl transition ${
                    d.day === bestDay.day && d.count > 0
                      ? "bg-gold-500"
                      : "bg-pine-700/80"
                  }`}
                  style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                />
              </div>
              <span className="text-xs capitalize text-ink-faint">{d.label}</span>
            </div>
          ))}
        </div>
        {bestDay.count > 0 && (
          <p className="mt-4 text-sm text-ink-soft">
            <span className="font-semibold capitalize text-pine-800">
              {bestDay.label}
            </span>{" "}
            est votre jour le plus fort — pensez à bien ouvrir vos créneaux.
          </p>
        )}
      </div>

      {/* Prochaines arrivées */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-pine-950">
            Prochaines arrivées
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
          <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Date · Créneau</th>
                  <th className="px-6 py-4 font-semibold">Montant</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b, i) => (
                  <tr
                    key={b.id}
                    className={i > 0 ? "border-t border-line" : ""}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink">
                        {b.guest_name ?? "Client"}
                      </p>
                      <p className="font-mono text-xs text-ink-faint">{b.code}</p>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">
                      <span className="capitalize">
                        {new Date(`${b.day}T12:00:00`).toLocaleDateString(
                          "fr-FR",
                          { weekday: "short", day: "numeric", month: "short" },
                        )}
                      </span>{" "}
                      · {SLOT_LABELS[b.slot_type as SlotType]}
                      {b.arrival_time ? ` · ${b.arrival_time}` : ""}
                    </td>
                    <td className="px-6 py-4 font-display font-semibold text-pine-900">
                      {formatPrice(b.total_fcfa)}
                    </td>
                    <td className="px-6 py-4">
                      {b.status === "pending" ? (
                        <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-600">
                          En attente
                        </span>
                      ) : (
                        <span className="rounded-full bg-pine-700/10 px-3 py-1 text-xs font-semibold text-pine-700">
                          Confirmée
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {establishments.length > 1 && (
        <p className="mt-6 text-sm text-ink-soft">
          Vous gérez {establishments.length} établissements — affichage du
          premier ici.
        </p>
      )}
    </div>
  );
}
