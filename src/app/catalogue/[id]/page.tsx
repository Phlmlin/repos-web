import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarCheck,
  MapPin,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { amenityIcon } from "@/lib/amenities";
import {
  SLOT_LABELS,
  SLOT_ORDER,
  TYPE_LABELS,
  averageRating,
  formatPrice,
  minPrice,
} from "@/lib/repos";
import { getEstablishment } from "@/lib/repos-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await getEstablishment(id);
  return {
    title: e ? `${e.name} — Repos` : "Établissement — Repos",
    description: e?.description ?? "Réservez une chambre à la journée.",
  };
}

export default async function EstablishmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await getEstablishment(id);
  if (!e) notFound();

  const min = minPrice(e.slot_prices);
  const avg = averageRating(e.reviews);
  const prices = SLOT_ORDER.map((s) =>
    e.slot_prices.find((p) => p.slot_type === s),
  ).filter((p) => p != null);
  const photos = e.photos.slice(0, 5);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-pine-800"
        >
          <ArrowLeft className="size-4" /> Retour au catalogue
        </Link>

        {/* Galerie */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4 sm:grid-rows-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-pine-50 sm:col-span-3 sm:row-span-2 sm:aspect-auto sm:min-h-[420px]">
            {photos[0] ? (
              <Image
                src={photos[0]}
                alt={e.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 75vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center">
                <BedDouble className="size-12 text-pine-200" />
              </div>
            )}
          </div>
          {photos.slice(1, 5).map((p, i) => (
            <div
              key={i}
              className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl bg-pine-50 sm:block"
            >
              <Image
                src={p}
                alt={`${e.name} — photo ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-pine-800 px-3.5 py-1.5 text-xs font-semibold text-paper">
                {TYPE_LABELS[e.type]}
              </span>
              {e.stars != null && e.stars > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3.5 py-1.5 text-xs font-semibold text-gold-600">
                  <Star className="size-3.5 fill-gold-500 text-gold-500" />
                  {e.stars} étoile{e.stars > 1 ? "s" : ""}
                </span>
              )}
              {avg != null && (
                <span className="text-sm font-medium text-ink-soft">
                  {avg.toFixed(1)}/5 · {e.reviews.length} avis
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-pine-950 sm:text-5xl">
              {e.name}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-[15px] text-ink-soft">
              <MapPin className="size-4 shrink-0 text-pine-700" />
              {e.city}
              {e.address ? ` — ${e.address}` : ""}
            </p>

            {e.description && (
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink">
                {e.description}
              </p>
            )}

            {e.amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold text-pine-950">
                  Équipements
                </h2>
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {e.amenities.map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <li
                        key={a}
                        className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-700">
                          <Icon className="size-4.5" />
                        </span>
                        <span className="text-sm font-medium text-ink">{a}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Tarifs */}
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-pine-950">
                Tarifs par créneau
              </h2>
              <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-white">
                {prices.map((p, i) => (
                  <div
                    key={p.slot_type}
                    className={`flex items-center justify-between px-6 py-4 ${
                      i > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-ink">
                        {SLOT_LABELS[p.slot_type]}
                      </p>
                      {p.weekend_price_fcfa != null &&
                        p.weekend_price_fcfa !== p.price_fcfa && (
                          <p className="text-xs text-ink-soft">
                            Week-end : {formatPrice(p.weekend_price_fcfa)}
                          </p>
                        )}
                    </div>
                    <p className="font-display text-xl font-semibold text-pine-900">
                      {formatPrice(p.price_fcfa)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                Tarifs indicatifs, susceptibles d'évoluer. Le prix final est
                confirmé à la réservation.
              </p>
            </section>

            {/* Avis */}
            {e.reviews.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold text-pine-950">
                  Avis clients
                </h2>
                <div className="mt-5 space-y-4">
                  {e.reviews.slice(0, 3).map((r) => (
                    <article
                      key={r.id}
                      className="rounded-3xl border border-line bg-white p-6"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-ink">
                          {r.client_name ?? "Client vérifié"}
                        </p>
                        <span className="flex items-center gap-1 text-sm font-semibold text-gold-600">
                          <Star className="size-4 fill-gold-500 text-gold-500" />
                          {r.rating}/5
                        </span>
                      </div>
                      {r.title && (
                        <p className="mt-2 font-medium text-pine-950">
                          {r.title}
                        </p>
                      )}
                      {r.comment && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                          {r.comment}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Carte de réservation */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
              <p className="text-sm text-ink-soft">
                {min != null ? (
                  <>
                    dès{" "}
                    <span className="font-display text-3xl font-semibold text-pine-950">
                      {formatPrice(min)}
                    </span>
                  </>
                ) : (
                  "Prix sur demande"
                )}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Choisissez votre créneau et réservez en 2 minutes.
              </p>
              <div className="mt-6 space-y-2.5">
                {prices.map((p) => (
                  <Link
                    key={p.slot_type}
                    href={`/reserver/${e.id}?slot=${p.slot_type}`}
                    className="flex items-center justify-between rounded-2xl border border-line px-5 py-3.5 transition hover:border-pine-700 hover:bg-pine-50"
                  >
                    <span className="text-sm font-semibold text-ink">
                      {SLOT_LABELS[p.slot_type]}
                    </span>
                    <span className="text-sm font-semibold text-pine-800">
                      {formatPrice(p.price_fcfa)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/reserver/${e.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-4 text-[15px] font-semibold text-pine-950 transition hover:bg-gold-400"
              >
                <CalendarCheck className="size-4.5" />
                Réserver maintenant
              </Link>
              <p className="mt-4 text-center text-xs text-ink-faint">
                Sans compte requis · Confirmation immédiate
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
