import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import {
  getEstablishmentBookings,
  getMyEstablishments,
} from "@/lib/tenancier/queries";
import { SLOT_LABELS, formatPrice, type SlotType } from "@/lib/repos";
import { BookingStatusButtons } from "./status-buttons";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  no_show: "Non présentée",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold-500/15 text-gold-600",
  confirmed: "bg-pine-700/10 text-pine-700",
  cancelled: "bg-clay-500/10 text-clay-600",
  completed: "bg-ink/5 text-ink-soft",
  no_show: "bg-clay-500/10 text-clay-600",
};

const FILTERS = [
  { v: "", label: "Toutes" },
  { v: "pending", label: "En attente" },
  { v: "confirmed", label: "Confirmées" },
  { v: "cancelled", label: "Annulées" },
];

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const ctx = await requireTenancier();
  const params = await searchParams;
  const filter = params.statut ?? "";

  const establishments = await getMyEstablishments(ctx);
  if (establishments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
        <p className="font-medium text-ink">
          Créez d'abord votre fiche établissement.
        </p>
        <Link
          href="/tableau-de-bord/etablissement/nouveau"
          className="mt-4 inline-block rounded-full bg-pine-800 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900"
        >
          Créer ma fiche
        </Link>
      </div>
    );
  }

  const est = establishments[0];
  const all = await getEstablishmentBookings(ctx, est.id);
  const bookings = filter ? all.filter((b) => b.status === filter) : all;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-pine-950">
        Réservations — {est.name}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {all.length} réservation{all.length > 1 ? "s" : ""} au total.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.v}
            href={
              f.v
                ? `/tableau-de-bord/reservations?statut=${f.v}`
                : "/tableau-de-bord/reservations"
            }
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.v
                ? "bg-pine-800 text-paper"
                : "border border-line bg-white text-ink-soft hover:border-pine-600 hover:text-pine-800"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-ink-soft">
          Aucune réservation dans cette catégorie.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-3xl border border-line bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-3">
                    <span className="font-display text-lg font-semibold text-pine-950">
                      {b.guest_name ?? "Client"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status] ?? ""}`}
                    >
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
                    <span className="font-mono font-semibold text-ink">
                      {b.code}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-ink-faint" />
                      <span className="capitalize">
                        {new Date(`${b.day}T12:00:00`).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </span>
                    <span>{SLOT_LABELS[b.slot_type as SlotType]}</span>
                    {b.arrival_time && (
                      <span>arrivée {b.arrival_time}</span>
                    )}
                    {b.guest_phone && (
                      <a
                        href={`tel:${b.guest_phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1.5 font-medium text-pine-700 hover:text-pine-900"
                      >
                        <Phone className="size-3.5" />
                        {b.guest_phone}
                      </a>
                    )}
                  </p>
                </div>
                <p className="font-display text-xl font-semibold text-pine-900">
                  {formatPrice(b.total_fcfa)}
                </p>
              </div>
              {b.status === "pending" && (
                <div className="mt-4 border-t border-line pt-4">
                  <BookingStatusButtons bookingId={b.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
