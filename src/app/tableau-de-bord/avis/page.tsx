import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";
import { requireTenancier } from "@/lib/auth/roles";
import {
  getEstablishmentReviews,
  getMyEstablishments,
} from "@/lib/tenancier/queries";
import { ReviewCard } from "./review-card";

export default async function AvisPage() {
  const ctx = await requireTenancier();
  const establishments = await getMyEstablishments(ctx);

  if (establishments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
        <p className="font-medium text-ink">
          Créez d'abord votre fiche établissement.
        </p>
        <Link
          href="/tableau-de-bord/etablissement/nouveau"
          className="mt-4 inline-block rounded-full bg-pine-800 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900"
        >
          Créer ma fiche
        </Link>
      </div>
    );
  }

  const est = establishments[0];
  const reviews = await getEstablishmentReviews(ctx, est.id);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-pine-950">
          Avis clients — {est.name}
        </h2>
        {avg != null && (
          <p className="text-sm font-medium text-ink-soft">
            Note moyenne :{" "}
            <span className="font-display text-lg font-semibold text-pine-900">
              {avg.toFixed(1)}/5
            </span>{" "}
            · {reviews.length} avis
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Répondre aux avis montre que vous êtes à l'écoute — bon pour votre
        note.
      </p>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
          <MessageSquareHeart className="mx-auto size-8 text-ink-faint" />
          <p className="mt-3 text-sm text-ink-soft">
            Aucun avis pour le moment. Les avis de vos clients apparaîtront
            ici.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}
