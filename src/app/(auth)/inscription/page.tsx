"use client";

import Link from "next/link";
import { use, useActionState, useState } from "react";
import { BedDouble, Building2, UserRound, UserPlus } from "lucide-react";
import { signUp, type AuthResult } from "@/lib/auth/actions";

const initial: AuthResult = {};

export default function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const [state, action, pending] = useActionState(signUp, initial);
  const params = use(searchParams);
  const [role, setRole] = useState<"client" | "tenancier">(
    params.role === "tenancier" ? "tenancier" : "client",
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-pine-950">
        Créer un compte
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Gratuit, en moins d'une minute. Vos réservations vous suivent partout.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Type de compte">
        {(
          [
            { v: "client", icon: UserRound, t: "Client", d: "Je réserve des chambres" },
            { v: "tenancier", icon: Building2, t: "Tenancier", d: "Je propose mon établissement" },
          ] as const
        ).map((r) => (
          <button
            key={r.v}
            type="button"
            role="radio"
            aria-checked={role === r.v}
            onClick={() => setRole(r.v)}
            className={`rounded-2xl border p-4 text-left transition ${
              role === r.v
                ? "border-pine-700 bg-pine-50 shadow-sm"
                : "border-line bg-white hover:border-ink-faint"
            }`}
          >
            <r.icon className={`size-5 ${role === r.v ? "text-pine-700" : "text-ink-faint"}`} />
            <p className="mt-2 text-sm font-semibold text-ink">{r.t}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{r.d}</p>
          </button>
        ))}
      </div>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="role" value={role} />
        <div>
          <label htmlFor="fullName" className="text-sm font-semibold text-ink">
            Nom complet
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Aïcha Bongo"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
          />
        </div>
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
            minLength={8}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
          />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm font-medium text-clay-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine-800 px-6 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
        >
          {role === "tenancier" ? (
            <BedDouble className="size-4" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {pending
            ? "Création…"
            : role === "tenancier"
              ? "Créer mon compte tenancier"
              : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-pine-800 hover:text-pine-950">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
