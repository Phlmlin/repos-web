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

  // Voie privilégiée : fonction sécurisée booking_by_code() (post-durcissement
  // RLS). Repli : lecture directe (politiques démo encore actives).
  type BookingView = {
    code: string;
    day: string;
    slot_type: string;
    total_fcfa: number;
    payment_method: string;
    status: string;
    guest_name: string | null;
    arrival_time: string | null;
    est_name: string;
    est_city: string;
    est_address: string | null;
    est_photos: string[];
  };
  let view: BookingView | null = null;

  const { data: rpcData } = await supabase.rpc("booking_by_code", {
    p_code: code,
  });
  const rpcRow = (rpcData as Array<Record<string, unknown>> | null)?.[0];
  if (rpcRow) {
    view = {
      code: String(rpcRow.code),
      day: String(rpcRow.day),
      slot_type: String(rpcRow.slot_type),
      total_fcfa: Number(rpcRow.total_fcfa),
      payment_method: String(rpcRow.payment_method),
      status: String(rpcRow.status),
      guest_name: (rpcRow.guest_name as string) ?? null,
      arrival_time: (rpcRow.arrival_time as string) ?? null,
      est_name: String(rpcRow.est_name),
      est_city: String(rpcRow.est_city),
      est_address: (rpcRow.est_address as string) ?? null,
      est_photos: (rpcRow.est_photos as string[]) ?? [],
    };
  } else {
    const { data: booking } = await supabase
      .from("bookings")
      .select(
        "code,day,slot_type,total_fcfa,payment_method,status,extras,establishments(name,city,address,photos)",
      )
      .eq("code", code)
      .single();
    if (booking) {
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
      view = {
        code: booking.code,
        day: booking.day,
        slot_type: booking.slot_type,
        total_fcfa: booking.total_fcfa,
        payment_method: booking.payment_method,
        status: booking.status,
        guest_name: extras.guest_name ?? null,
        arrival_time: extras.arrival_time ?? null,
        est_name: est.name,
        est_city: est.city,
        est_address: est.address,
        est_photos: est.photos ?? [],
      };
    }
  }

  if (!view) notFound();
  const frDay = new Date(`${view.day}T12:00:00`).toLocaleDateString(
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
            {STATUS_LABELS[view.status] ?? view.status}.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border-2 border-dashed border-pine-700/40 bg-white p-8 text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            <Ticket className="size-4" /> Code de réservation
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-wider text-pine-950 sm:text-5xl">
            {view.code}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Conservez-le précieusement — il fait office de justificatif.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-white">
          {view.est_photos[0] && (
            <div className="relative aspect-[21/9]">
              <Image
                src={view.est_photos[0]}
                alt={view.est_name}
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
                {view.est_name}
              </dd>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin className="size-3.5 text-ink-faint" />
                {view.est_city}
                {view.est_address ? ` — ${view.est_address}` : ""}
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
                  {SLOT_LABELS[view.slot_type as SlotType]}
                  {view.arrival_time
                    ? ` · arrivée ${view.arrival_time}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Paiement
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {PAYMENT_LABELS[view.payment_method] ??
                    view.payment_method}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Total
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold text-pine-900">
                  {formatPrice(view.total_fcfa)}
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
