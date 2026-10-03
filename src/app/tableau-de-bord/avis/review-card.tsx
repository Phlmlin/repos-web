"use client";

import { useActionState, useState } from "react";
import { MessageCircleReply, Star } from "lucide-react";
import { replyToReview, type TenancierResult } from "@/lib/tenancier/actions";
import type { TenancierReview } from "@/lib/tenancier/queries";

const initial: TenancierResult = { ok: false };

function ReplyForm({ reviewId, existing }: { reviewId: string; existing: string | null }) {
  const [state, action, pending] = useActionState(replyToReview, initial);
  const [open, setOpen] = useState(false);

  if (!open && existing) {
    return (
      <div className="mt-4 rounded-2xl bg-pine-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-pine-700">
          Votre réponse
        </p>
        <p className="mt-1 text-sm text-ink">{existing}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-xs font-semibold text-pine-700 hover:text-pine-900"
        >
          Modifier
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pine-700 hover:text-pine-900"
      >
        <MessageCircleReply className="size-4" />
        Répondre à cet avis
      </button>
    );
  }

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="review_id" value={reviewId} />
      <textarea
        name="reply"
        rows={3}
        defaultValue={existing ?? ""}
        placeholder="Merci pour votre visite…"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-ink-faint focus:border-pine-600"
      />
      {state?.error && (
        <p className="mt-2 text-xs text-clay-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="mt-2 text-xs font-medium text-pine-700">
          Réponse publiée.
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pine-800 px-5 py-2 text-xs font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Publier la réponse"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-line px-5 py-2 text-xs font-semibold text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export function ReviewCard({ review }: { review: TenancierReview }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">
            {review.client_name ?? "Client vérifié"}
          </p>
          <p className="text-xs text-ink-faint">
            {new Date(review.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-600">
          <Star className="size-3.5 fill-gold-500 text-gold-500" />
          {review.rating}/5
        </span>
      </div>
      {review.title && (
        <p className="mt-3 font-medium text-pine-950">{review.title}</p>
      )}
      {review.comment && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {review.comment}
        </p>
      )}
      <div className="mt-2 border-t border-line pt-2">
        <ReplyForm reviewId={review.id} existing={review.owner_reply} />
      </div>
    </article>
  );
}
