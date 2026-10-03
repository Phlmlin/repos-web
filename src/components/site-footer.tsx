import Link from "next/link";
import { BedDouble } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-pine-800 text-paper">
              <BedDouble className="size-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-pine-950">
              Repos
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            La plateforme gabonaise de réservation d'hôtels en journée.
            Une chambre pour quelques heures, au meilleur prix, près de chez
            vous.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            Découvrir
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="#" className="transition hover:text-pine-800">Établissements</Link></li>
            <li><Link href="#" className="transition hover:text-pine-800">Autour de moi</Link></li>
            <li><Link href="#" className="transition hover:text-pine-800">Offres du moment</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            Partenaires
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="#" className="transition hover:text-pine-800">Devenir tenancier</Link></li>
            <li><Link href="#" className="transition hover:text-pine-800">Tarifs & commissions</Link></li>
            <li><Link href="#" className="transition hover:text-pine-800">Nous contacter</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-ink-faint sm:flex-row sm:px-6">
          <p>© 2026 Repos · Libreville, Gabon</p>
          <p>Paiement à l'arrivée ou par Mobile Money</p>
        </div>
      </div>
    </footer>
  );
}
