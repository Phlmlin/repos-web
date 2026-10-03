"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { priceForDay, type SlotType } from "@/lib/repos";

export interface BookingResult {
  ok: boolean;
  error?: string;
}

const SLOTS: SlotType[] = ["3h", "6h", "journee", "nuit"];
const PAYMENTS = ["airtel", "moov", "carte", "sur_place"];

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return `REPOS-${s}`;
}

export async function createBooking(
  _prev: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const establishmentId = String(formData.get("establishment_id") ?? "");
  const day = String(formData.get("day") ?? "");
  const slot = String(formData.get("slot_type") ?? "") as SlotType;
  const arrivalTime = String(formData.get("arrival_time") ?? "");
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestPhone = String(formData.get("guest_phone") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "");

  if (!establishmentId || !SLOTS.includes(slot))
    return { ok: false, error: "Créneau invalide." };
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < today)
    return { ok: false, error: "Choisissez une date à venir." };
  if (guestName.length < 2)
    return { ok: false, error: "Indiquez votre nom complet." };
  if (!/^\+?[0-9][0-9 .\-()]{6,}$/.test(guestPhone))
    return { ok: false, error: "Numéro de téléphone invalide." };
  if (!PAYMENTS.includes(paymentMethod))
    return { ok: false, error: "Choisissez un moyen de paiement." };

  const supabase = await createClient();

  const { data: prices } = await supabase
    .from("slot_prices")
    .select("slot_type,price_fcfa,weekend_price_fcfa")
    .eq("establishment_id", establishmentId);
  const sp = (prices ?? []).find((p) => p.slot_type === slot);
  if (!sp) return { ok: false, error: "Ce créneau n'est pas proposé." };
  const total = priceForDay(sp, day);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let code = "";
  for (let i = 0; i < 5; i++) {
    const candidate = makeCode();
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("code", candidate)
      .maybeSingle();
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) return { ok: false, error: "Veuillez réessayer un instant." };

  // Coordonnées invité stockées dans extras (jsonb) — voir
  // supabase/migrations/001_guest_columns.sql pour la future colonne dédiée.
  const { error } = await supabase.from("bookings").insert({
    code,
    establishment_id: establishmentId,
    client_id: user?.id ?? null,
    day,
    slot_type: slot,
    extras: {
      guest_name: guestName,
      guest_phone: guestPhone,
      arrival_time: arrivalTime || null,
      items: [],
    },
    total_fcfa: total,
    payment_method: paymentMethod,
    payment_status: paymentMethod === "sur_place" ? "on_site" : "pending",
    status: "pending",
  });
  if (error)
    return { ok: false, error: "La réservation a échoué. Réessayez." };

  redirect(`/reservation/${code}`);
}

export async function cancelBooking(
  _prev: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const bookingId = String(formData.get("booking_id") ?? "");
  if (!bookingId) return { ok: false, error: "Réservation introuvable." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Connectez-vous pour annuler." };

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("client_id", user.id)
    .in("status", ["pending", "confirmed"]);

  if (error) return { ok: false, error: "Annulation impossible." };
  return { ok: true };
}
