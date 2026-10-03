"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import {
  updateBookingStatus,
  type TenancierResult,
} from "@/lib/tenancier/actions";

const initial: TenancierResult = { ok: false };

export function BookingStatusButtons({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState(updateBookingStatus, initial);

  const btn = (status: string, label: string, Icon: typeof Check, cls: string) => (
    <form key={status} action={action} className="inline">
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${cls}`}
      >
        <Icon className="size-3.5" />
        {label}
      </button>
    </form>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        {btn("confirmed", "Confirmer", Check, "bg-pine-700 text-paper hover:bg-pine-800")}
        {btn("cancelled", "Refuser", X, "border border-line bg-white text-clay-600 hover:border-clay-500")}
      </div>
      {state?.error && (
        <p className="text-xs text-clay-600">{state.error}</p>
      )}
    </div>
  );
}
