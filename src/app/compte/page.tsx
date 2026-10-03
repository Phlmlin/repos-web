import { redirect } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-pine-700">
            Mon compte
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-pine-950">
            Bonjour, {profile?.full_name ?? user.email}
          </h1>

          <div className="mt-8 rounded-3xl border border-line bg-white p-8">
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
            <dl className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-paper p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Rôle
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold capitalize text-pine-950">
                  {profile?.role ?? "client"}
                </dd>
              </div>
              <div className="rounded-2xl bg-paper p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Points
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold text-pine-950">
                  {profile?.loyalty_points ?? 0}
                </dd>
              </div>
              <div className="rounded-2xl bg-paper p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Parrainage
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold text-pine-950">
                  {profile?.referral_code ?? "—"}
                </dd>
              </div>
            </dl>
            <form action={signOut} className="mt-8">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-clay-500 hover:text-clay-600"
              >
                <LogOut className="size-4" />
                Se déconnecter
              </button>
            </form>
          </div>

          <p className="mt-6 text-sm text-ink-soft">
            Vos réservations, favoris et programme fidélité arrivent ici très
            vite — le catalogue et la réservation sont en cours de branchement.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
