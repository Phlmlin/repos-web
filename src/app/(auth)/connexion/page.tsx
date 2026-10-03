"use client";

import Link from "next/link";
import { use, useActionState } from "react";
import { LogIn, MailCheck } from "lucide-react";
import { signIn, type AuthResult } from "@/lib/auth/actions";

const initial: AuthResult = {};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine-800 px-6 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
    >
      <LogIn className="size-4" />
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const [state, action, pending] = useActionState(signIn, initial);
  const params = use(searchParams);

  return (
    <div>
      {params.message === "confirmez-email" && (
        <p role="status" className="mb-6 flex items-start gap-3 rounded-xl bg-pine-50 px-4 py-3 text-sm font-medium text-pine-800">
          <MailCheck className="mt-0.5 size-5 shrink-0" />
          Compte créé ! Cliquez sur le lien reçu par email, puis connectez-vous.
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-pine-950">
        Bon retour
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Connectez-vous pour retrouver vos réservations et vos favoris.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-ink">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
          />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm font-medium text-clay-600">
            {state.error}
          </p>
        )}

        <SubmitButton pending={pending} />
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-pine-800 hover:text-pine-950">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
