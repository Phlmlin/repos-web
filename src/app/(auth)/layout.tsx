import Link from "next/link";
import { BedDouble } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-cream">
      <header className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-pine-800 text-paper">
            <BedDouble className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-pine-950">
            Repos
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-[0_30px_60px_-30px_rgba(20,53,36,0.3)] sm:p-10">
          {children}
        </div>
      </main>
      <footer className="pb-8 text-center text-xs text-ink-faint">
        Vos données restent au Gabon, chez vous.
      </footer>
    </div>
  );
}
