import Link from "next/link";
import { BedDouble } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-pine-800 text-paper">
            <BedDouble className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-pine-950">
            Repos
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <Link href="/catalogue" className="transition hover:text-pine-800">
            Établissements
          </Link>
          <Link href="/#comment-ca-marche" className="transition hover:text-pine-800">
            Comment ça marche
          </Link>
          <Link href="/#tenanciers" className="transition hover:text-pine-800">
            Tenanciers
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden text-sm font-semibold text-pine-800 transition hover:text-pine-950 sm:block"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-pine-800 px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-900"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}
