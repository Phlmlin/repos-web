import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import { getMyEstablishments } from "@/lib/tenancier/queries";
import { EditEstablishmentForms } from "./forms";

export default async function EtablissementPage() {
  const ctx = await requireTenancier();
  const establishments = await getMyEstablishments(ctx);
  if (establishments.length === 0)
    redirect("/tableau-de-bord/etablissement/nouveau");

  const est = establishments[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-pine-950">
          {est.name}
        </h2>
        <Link
          href={`/catalogue/${est.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-pine-700 hover:text-pine-900"
        >
          <ExternalLink className="size-4" />
          Voir ma fiche publique
        </Link>
      </div>
      <div className="mt-6 max-w-3xl">
        <EditEstablishmentForms establishment={est} />
      </div>
      {establishments.length > 1 && (
        <p className="mt-6 text-sm text-ink-soft">
          Vous gérez {establishments.length} établissements — modification du
          premier ici.
        </p>
      )}
    </div>
  );
}
