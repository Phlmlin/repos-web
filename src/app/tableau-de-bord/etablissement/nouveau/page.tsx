import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import { CreateEstablishmentForm } from "../forms";

export default async function NouveauEtablissementPage() {
  const ctx = await requireTenancier();
  const { data: existing } = await ctx.supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", ctx.userId)
    .limit(1);
  if (existing && existing.length > 0) redirect("/tableau-de-bord/etablissement");

  return (
    <div>
      <Link
        href="/tableau-de-bord"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-pine-800"
      >
        <ArrowLeft className="size-4" /> Tableau de bord
      </Link>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-pine-950">
        Créer votre établissement
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        Votre fiche sera visible immédiatement dans le catalogue. Vous pourrez
        ajouter des photos ensuite.
      </p>
      <div className="mt-8 max-w-3xl rounded-3xl border border-line bg-white p-7 sm:p-9">
        <CreateEstablishmentForm />
      </div>
    </div>
  );
}
