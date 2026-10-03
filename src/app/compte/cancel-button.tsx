"use client";

import { useActionState } from "react";
import { cancelBooking, type BookingResult } from "@/lib/bookings/actions";

const initial: BookingResult = { ok: false };

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState(cancelBooking, initial);
  return (
    <form action={action}>
      <input type="hidden" name="booking_id" value={bookingId} />
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!window.confirm("Annuler cette réservation ?")) e.preventDefault();
        }}
        className="text-sm font-medium text-clay-600 transition hover:text-clay-500 disabled:opacity-50"
      >
        {pending ? "Annulation…" : "Annuler"}
      </button>
      {state?.error && (
        <p className="mt-1 text-xs text-clay-600">{state.error}</p>
      )}
    </form>
  );
}
