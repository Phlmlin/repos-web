"use client";

import { useActionState } from "react";
import { Check, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  resolveFlaggedReview,
  setEstablishmentActive,
  type AdminResult,
} from "@/lib/admin/actions";

const initial: AdminResult = { ok: false };

export function ValidateEstablishmentButton({
  establishmentId,
  active,
}: {
  establishmentId: string;
  active: boolean;
}) {
  const [state, action, pending] = useActionState(
    setEstablishmentActive,
    initial,
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="establishment_id" value={establishmentId} />
      <input type="hidden" name="is_active" value={String(!active)} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
          active
            ? "border border-line bg-white text-ink-soft hover:border-clay-500 hover:text-clay-600"
            : "bg-pine-700 text-paper hover:bg-pine-800"
        }`}
      >
        {active ? (
          <>
            <EyeOff className="size-3.5" /> Masquer
          </>
        ) : (
          <>
            <Eye className="size-3.5" /> Valider
          </>
        )}
      </button>
      {state?.error && <p className="mt-1 text-xs text-clay-600">{state.error}</p>}
    </form>
  );
}

export function FlaggedReviewButtons({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(
    resolveFlaggedReview,
    initial,
  );

  const btn = (
    modAction: string,
    label: string,
    Icon: typeof Check,
    cls: string,
  ) => (
    <form key={modAction} action={action} className="inline">
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="mod_action" value={modAction} />
      <button
        type="submit"
        disabled={pending}
        onClick={
          modAction === "delete"
            ? (e) => {
                if (!window.confirm("Supprimer définitivement cet avis ?"))
                  e.preventDefault();
              }
            : undefined
        }
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${cls}`}
      >
        <Icon className="size-3.5" />
        {label}
      </button>
    </form>
  );

  return (
    <div>
      <div className="flex gap-2">
        {btn("unflag", "Réhabiliter", Check, "bg-pine-700 text-paper hover:bg-pine-800")}
        {btn("delete", "Supprimer", Trash2, "border border-line bg-white text-clay-600 hover:border-clay-500")}
      </div>
      {state?.error && <p className="mt-1 text-xs text-clay-600">{state.error}</p>}
    </div>
  );
}
