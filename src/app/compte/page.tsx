import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, LogOut, MapPin, Ticket, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SLOT_LABELS, formatPrice, type SlotType } from "@/lib/repos";
import { CancelButton } from "./cancel-button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold-500/15 text-gold-600",
  confirmed: "bg-pine-700/10 text-pine-700",
  cancelled: "bg-clay-500/10 text-clay-600",
  completed: "bg-ink/5 text-ink-soft",
  no_show: "bg-clay-500/10 text-clay-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  no_show: "Non présentée",
};

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, loyalty_points, referral_code")
    .eq("id", user.id)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id,code,day,slot_type,total_fcfa,payment_method,status,extras,establishment_id,establishments(name,city,photos)",
    )
    .eq("client_id", user.id)
    .order("day", { ascending: false })
    .limit(20);

  const upcoming = (bookings ?? []).filter(
    (b) => b.day >= new Date().toISOString().slice(0, 10) && ["pending", "confirmed"].includes(b.status),
  );
  const past = (bookings ?? []).filter((b) => !upcoming.includes(b));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pine-700">
          Mon compte
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-pine-950">
          Bonjour, {profile?.full_name ?? user.email}
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Profil */}
          <div className="rounded-3xl border border-line bg-white p-7 lg:col-span-1">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                <UserRound className="size-7" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-pine-950">
                  {profile?.full_name ?? "—"}
                </p>
                <p className="text-sm text-ink-soft">{user.email}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-paper p-3">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  Rôle
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-pine-950">
                  {profile?.role ?? "client"}
                </dd>
              </div>
              <div className="rounded-2xl bg-paper p-3">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  Points
                </dt>
                <dd className="mt-1 text-sm font-semibold text-pine-950">
                  {profile?.loyalty_points ?? 0}
                </dd>
              </div>
              <div className="rounded-2xl bg-paper p-3">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  Parrainage
                </dt>
                <dd className="mt-1 text-sm font-semibold text-pine-950">
                  {profile?.referral_code ?? "—"}
                </dd>
              </div>
            </dl>
            {profile?.role === "tenancier" && (
              <Link
                href="/tableau-de-bord"
                className="mt-6 block rounded-full bg-pine-800 px-6 py-3 text-center text-sm font-semibold text-paper transition hover:bg-pine-900"
              >
                Mon tableau de bord
              </Link>
            )}
            <form action={signOut} className="mt-4">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-clay-500 hover:text-clay-600"
              >
                <LogOut className="size-4" />
                Se déconnecter
              </button>
            </form>
          </div>

          {/* Réservations */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Mes réservations
            </h2>

            {(!bookings || bookings.length === 0) && (
              <div className="mt-5 rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
                <Ticket className="mx-auto size-8 text-ink-faint" />
                <p className="mt-3 font-medium text-ink">
                  Aucune réservation pour le moment
                </p>
                <Link
                  href="/catalogue"
                  className="mt-5 inline-block rounded-full bg-pine-800 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900"
                >
                  Explorer le catalogue
                </Link>
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="mt-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  À venir
                </h3>
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} cancellable />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Passées
                </h3>
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

type Booking = {
  id: string;
  code: string;
  day: string;
  slot_type: string;
  total_fcfa: number;
  payment_method: string;
  status: string;
  extras: unknown;
  establishment_id: string;
  establishments: unknown;
};

const PAYMENT_LABELS: Record<string, string> = {
  airtel: "Airtel Money",
  moov: "Moov Money",
  carte: "Carte bancaire",
  sur_place: "Sur place",
};

function BookingCard({
  booking: b,
  cancellable = false,
}: {
  booking: Booking;
  cancellable?: boolean;
}) {
  const est = b.establishments as unknown as {
    name: string;
    city: string;
    photos: string[];
  } | null;
  const frDay = new Date(`${b.day}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const extras = (b.extras ?? {}) as { arrival_time?: string | null };
  return (
    <article className="flex gap-4 rounded-3xl border border-line bg-white p-4">
      {est?.photos?.[0] ? (
        <div className="relative hidden size-24 shrink-0 overflow-hidden rounded-2xl sm:block">
          <Image
            src={est.photos[0]}
            alt={est.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-pine-950">
              {est?.name ?? "Établissement"}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-ink-soft">
              <MapPin className="size-3.5 shrink-0 text-ink-faint" />
              {est?.city}
              <span className="text-ink-faint">·</span>
              <CalendarDays className="size-3.5 shrink-0 text-ink-faint" />
              <span className="capitalize">{frDay}</span>
              <span className="text-ink-faint">·</span>
              {SLOT_LABELS[b.slot_type as SlotType]}
              {extras.arrival_time && (
                <>
                  <span className="text-ink-faint">·</span>
                  <span>dès {extras.arrival_time}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {PAYMENT_LABELS[b.payment_method] ?? b.payment_method}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status] ?? "bg-ink/5 text-ink-soft"}`}
          >
            {STATUS_LABELS[b.status] ?? b.status}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-sm text-ink-soft">
            <span className="font-mono font-semibold text-ink">{b.code}</span>
            <span className="mx-2 text-ink-faint">·</span>
            <span className="font-semibold text-pine-900">
              {formatPrice(b.total_fcfa)}
            </span>
          </p>
          <div className="flex items-center gap-4">
            {!cancellable && b.establishment_id && (
              <Link
                href={`/reserver/${b.establishment_id}`}
                className="text-sm font-medium text-pine-700 hover:text-pine-900"
              >
                Re-réserver
              </Link>
            )}
            {cancellable ? (
              <CancelButton bookingId={b.id} />
            ) : (
              <Link
                href={`/reservation/${b.code}`}
                className="text-sm font-medium text-pine-700 hover:text-pine-900"
              >
                Détails
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
