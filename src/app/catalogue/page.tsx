import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Search, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  TYPE_LABELS,
  formatPrice,
  minPrice,
  type EstablishmentType,
} from "@/lib/repos";
import { getEstablishments } from "@/lib/repos-server";

export const metadata = {
  title: "Catalogue — Repos",
  description:
    "Hôtels, motels, maisons meublées et auberges disponibles à la journée au Gabon.",
};

const TYPES: EstablishmentType[] = ["hotel", "motel", "maison", "auberge"];

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ville?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const ville = params.ville ?? "";
  const type = (params.type ?? "") as EstablishmentType | "";

  const all = await getEstablishments();
  const villes = [...new Set(all.map((e) => e.city))].sort();

  const results = all.filter((e) => {
    if (ville && e.city !== ville) return false;
    if (type && e.type !== type) return false;
    if (
      q &&
      !`${e.name} ${e.city} ${e.address ?? ""}`.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const chip = (href: string, active: boolean, label: string) => (
    <Link
      key={label}
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-pine-800 text-paper"
          : "border border-line bg-white text-ink-soft hover:border-pine-600 hover:text-pine-800"
      }`}
    >
      {label}
    </Link>
  );

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    if (over.q ?? q) p.set("q", over.q ?? q);
    if (over.ville ?? ville) p.set("ville", over.ville ?? ville);
    if (over.type ?? type) p.set("type", over.type ?? type);
    const s = p.toString();
    return s ? `/catalogue?${s}` : "/catalogue";
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pine-700">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-pine-950 sm:text-5xl">
          Où passer votre journée ?
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-soft">
          {results.length} établissement{results.length > 1 ? "s" : ""}{" "}
          disponible{results.length > 1 ? "s" : ""} à la journée.
        </p>

        {/* Filtres */}
        <form
          action="/catalogue"
          method="get"
          className="mt-8 flex flex-col gap-3 rounded-3xl border border-line bg-white p-4 sm:flex-row"
        >
          <label className="flex flex-1 items-center gap-2 rounded-2xl bg-paper px-4 py-3">
            <Search className="size-4 shrink-0 text-ink-faint" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Nom, quartier, ville…"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
            />
          </label>
          <select
            name="ville"
            defaultValue={ville}
            className="rounded-2xl bg-paper px-4 py-3 text-[15px] text-ink outline-none"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-pine-800 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900"
          >
            Rechercher
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {chip(qs({ type: "" }), !type, "Tous")}
          {TYPES.map((t) => chip(qs({ type: t }), type === t, TYPE_LABELS[t]))}
        </div>

        {/* Résultats */}
        {results.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center">
            <BedDouble className="mx-auto size-8 text-ink-faint" />
            <p className="mt-4 font-display text-xl font-semibold text-pine-950">
              Aucun établissement trouvé
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Essayez d'élargir votre recherche ou de changer de ville.
            </p>
            <Link
              href="/catalogue"
              className="mt-6 inline-block rounded-full bg-pine-800 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900"
            >
              Tout afficher
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((e) => {
              const min = minPrice(e.slot_prices);
              return (
                <Link
                  key={e.id}
                  href={`/catalogue/${e.id}`}
                  className="group overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-pine-50">
                    {e.photos[0] ? (
                      <Image
                        src={e.photos[0]}
                        alt={e.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <BedDouble className="size-10 text-pine-200" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold text-pine-900">
                      {TYPE_LABELS[e.type]}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-lg font-semibold leading-snug text-pine-950">
                        {e.name}
                      </h2>
                      {e.stars != null && e.stars > 0 && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 text-xs font-semibold text-gold-600">
                          <Star className="size-3 fill-gold-500 text-gold-500" />
                          {e.stars}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
                      <MapPin className="size-3.5 shrink-0 text-ink-faint" />
                      {e.city}
                      {e.address ? ` — ${e.address}` : ""}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <p className="text-sm text-ink-soft">
                        {min != null ? (
                          <>
                            dès{" "}
                            <span className="font-display text-lg font-semibold text-pine-900">
                              {formatPrice(min)}
                            </span>
                          </>
                        ) : (
                          "Prix sur demande"
                        )}
                      </p>
                      <span className="text-sm font-semibold text-pine-700 transition group-hover:text-pine-900">
                        Voir →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
