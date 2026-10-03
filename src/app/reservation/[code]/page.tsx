import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Copy,
  MapPin,
  Ticket,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { SLOT_LABELS, formatPrice, type SlotType } from "@/lib/repos";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de confirmation",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  no_show: "Non présentée",
};

const PAYMENT_LABELS: Record<string, string> = {
  airtel: "Airtel Money",
  moov: "Moov Money",
  carte: "Carte bancaire",
  sur_place: "Sur place",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return { title: `Réservation ${code} — Repos` };
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "code,day,slot_type,total_fcfa,payment_method,status,extras,establishments(name,city,address,photos)",
    )
    .eq("code", code)
    .single();

  if (!booking) notFound();

  const est = booking.establishments as unknown as {
    name: string;
    city: string;
    address: string | null;
    photos: string[];
  };
  const extras = (booking.extras ?? {}) as {
    guest_name?: string;
    arrival_time?: string | null;
  };
  const frDay = new Date(`${booking.day}T12:00:00`).toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-pine-700 text-paper">
            <BadgeCheck className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-pine-950">
            Réservation enregistrée
          </h1>
          <p className="mt-3 text-[15px] text-ink-soft">
            Présentez ce code à votre arrivée.{" "}
            {STATUS_LABELS[booking.status] ?? booking.status}.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border-2 border-dashed border-pine-700/40 bg-white p-8 text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            <Ticket className="size-4" /> Code de réservation
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-wider text-pine-950 sm:text-5xl">
            {booking.code}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Conservez-le précieusement — il fait office de justificatif.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-white">
          {est.photos[0] && (
            <div className="relative aspect-[21/9]">
              <Image
                src={est.photos[0]}
                alt={est.name}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}
          <dl className="space-y-4 p-7">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                Établissement
              </dt>
              <dd className="mt-1 font-display text-xl font-semibold text-pine-950">
                {est.name}
              </dd>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin className="size-3.5 text-ink-faint" />
                {est.city}
                {est.address ? ` — ${est.address}` : ""}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  <CalendarDays className="size-3.5" /> Date
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-ink">
                  {frDay}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  <Clock className="size-3.5" /> Créneau
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {SLOT_LABELS[booking.slot_type as SlotType]}
                  {extras.arrival_time
                    ? ` · arrivée ${extras.arrival_time}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Paiement
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {PAYMENT_LABELS[booking.payment_method] ??
                    booking.payment_method}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Total
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold text-pine-900">
                  {formatPrice(booking.total_fcfa)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/compte"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-800 px-8 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900"
          >
            <Copy className="size-4" /> Mes réservations
          </Link>
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-3.5 text-[15px] font-semibold text-ink transition hover:border-pine-600"
          >
            Retour au catalogue
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
