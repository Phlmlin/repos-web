import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const ARGUMENTS = [
  {
    icon: Clock,
    title: "À l'heure, pas à la nuit",
    text: "Réservez une chambre pour 3 h, 6 h ou la journée. Payez le temps dont vous avez vraiment besoin.",
  },
  {
    icon: MapPin,
    title: "Autour de vous",
    text: "Géolocalisation et tri par distance réelle pour trouver le meilleur établissement près de chez vous.",
  },
  {
    icon: Wallet,
    title: "Paiement flexible",
    text: "Airtel Money, Moov Money, carte bancaire ou règlement à l'arrivée. Sans engagement.",
  },
  {
    icon: ShieldCheck,
    title: "Annulation gratuite",
    text: "Changez d'avis sans frais jusqu'au dernier moment sur la plupart des établissements.",
  },
];

const ETAPES = [
  {
    n: "01",
    title: "Cherchez",
    text: "Ville, date, créneau : trouvez l'établissement idéal en quelques secondes.",
  },
  {
    n: "02",
    title: "Réservez",
    text: "Choisissez vos extras, payez en ligne ou sur place. Confirmation immédiate.",
  },
  {
    n: "03",
    title: "Reposez-vous",
    text: "Présentez votre code de réservation à la réception. C'est tout.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HÉROS */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--color-gold-100),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-pine-800">
              <BadgePercent className="size-4" />
              Jusqu'à −30 % sur les créneaux journée
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-pine-950 sm:text-6xl">
              Une chambre d'hôtel,
              <br />
              le temps d'une <em className="not-italic text-pine-700">pause</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Repos vous ouvre les portes des hôtels, motels et maisons
              meublées du Gabon pour quelques heures : sieste, télétravail au
              calme, ou escale entre deux vols.
            </p>

            {/* Barre de recherche */}
            <form
              className="mt-10 flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-[0_20px_50px_-20px_rgba(20,53,36,0.25)] sm:flex-row sm:items-center sm:rounded-full sm:py-2 sm:pl-6 sm:pr-2"
              action="/catalogue"
              method="get"
            >
              <label className="flex flex-1 items-center gap-3 px-3 py-2">
                <Search className="size-5 shrink-0 text-ink-faint" />
                <span className="sr-only">Destination</span>
                <input
                  name="q"
                  placeholder="Ville, quartier, établissement…"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
                />
              </label>
              <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
              <label className="flex flex-1 items-center gap-3 px-3 py-2">
                <Clock className="size-5 shrink-0 text-ink-faint" />
                <span className="sr-only">Créneau</span>
                <select
                  name="creneau"
                  className="w-full bg-transparent text-[15px] outline-none"
                  defaultValue="journee"
                >
                  <option value="3h">Sieste · 3 h</option>
                  <option value="6h">Pause · 6 h</option>
                  <option value="journee">Journée</option>
                  <option value="nuit">Nuit</option>
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pine-800 px-7 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 sm:rounded-full"
              >
                Rechercher
                <ArrowRight className="size-4" />
              </button>
            </form>

            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-4">
              {[
                ["120+", "établissements partenaires"],
                ["4,8/5", "note moyenne des clients"],
                ["15 min", "pour réserver et s'installer"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-semibold text-pine-950">
                    {v}
                  </dd>
                  <dd className="mt-1 text-sm text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ARGUMENTS */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ARGUMENTS.map((a) => (
              <article
                key={a.title}
                className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(20,53,36,0.2)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-pine-50 text-pine-700">
                  <a.icon className="size-5" strokeWidth={2} />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-pine-950">
                  {a.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {a.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section id="comment-ca-marche" className="bg-pine-950 text-paper">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
              Simple comme bonjour
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight">
              Réserver prend moins d'une minute
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {ETAPES.map((e) => (
                <div key={e.n} className="border-t border-white/15 pt-6">
                  <p className="font-display text-sm font-semibold tracking-widest text-gold-500">
                    {e.n}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">
                    {e.text}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/inscription"
              className="mt-12 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-[15px] font-semibold text-pine-950 transition hover:bg-gold-600 hover:text-white"
            >
              Créer mon compte gratuit
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* TENANCIERS */}
        <section id="tenanciers" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 rounded-3xl border border-line bg-cream p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-600">
                Pour les établissements
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-pine-950">
                Remplissez vos chambres creuses
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Vos chambres inoccupées en journée deviennent des revenus.
                Calendrier, tarifs dynamiques, messagerie clients et
                statistiques : tout est piloté depuis votre tableau de bord.
              </p>
              <Link
                href="/inscription?role=tenancier"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900"
              >
                Proposer mon établissement
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-5">
              {[
                ["+28 %", "de taux d'occupation en moyenne"],
                ["0 FCFA", "d'abonnement pour commencer"],
                ["15 %", "de commission, sans frais cachés"],
                ["24/7", "tableau de bord en temps réel"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-2xl border border-line bg-paper p-5"
                >
                  <dd className="font-display text-3xl font-semibold text-pine-800">
                    {v}
                  </dd>
                  <dt className="mt-1 text-sm text-ink-soft">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
