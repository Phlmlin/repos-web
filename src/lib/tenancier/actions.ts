"use server";

import { redirect } from "next/navigation";
import { requireTenancier } from "@/lib/auth/roles";
import type { EstablishmentType, SlotType } from "@/lib/repos";

export interface TenancierResult {
  ok: boolean;
  error?: string;
}

const TYPES: EstablishmentType[] = ["hotel", "motel", "maison", "auberge"];
const SLOTS: SlotType[] = ["3h", "6h", "journee", "nuit"];

async function ownedEstablishmentId(
  ctx: Awaited<ReturnType<typeof requireTenancier>>,
  establishmentId: string,
): Promise<boolean> {
  if (ctx.role === "admin") return true;
  const { data } = await ctx.supabase
    .from("establishments")
    .select("id")
    .eq("id", establishmentId)
    .eq("owner_id", ctx.userId)
    .single();
  return !!data;
}

function parsePrice(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = parseInt(String(v).replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function createEstablishment(
  _prev: TenancierResult,
  formData: FormData,
): Promise<TenancierResult> {
  const ctx = await requireTenancier();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as EstablishmentType;
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const stars = parseInt(String(formData.get("stars") ?? "0"), 10);
  const amenities = String(formData.get("amenities") ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (name.length < 2) return { ok: false, error: "Nom trop court." };
  if (!TYPES.includes(type)) return { ok: false, error: "Type invalide." };
  if (city.length < 2) return { ok: false, error: "Ville requise." };

  const { data: est, error } = await ctx.supabase
    .from("establishments")
    .insert({
      owner_id: ctx.userId,
      name,
      type,
      city,
      address: address || null,
      description: description || null,
      stars: stars >= 0 && stars <= 5 ? stars : 0,
      amenities,
      photos: [],
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !est)
    return { ok: false, error: "Création impossible. Réessayez." };

  const rows = SLOTS.flatMap((slot) => {
    const price = parsePrice(formData.get(`price_${slot}`));
    if (price == null) return [];
    return [
      {
        establishment_id: est.id,
        slot_type: slot,
        price_fcfa: price,
        weekend_price_fcfa: parsePrice(
          formData.get(`weekend_price_${slot}`),
        ),
      },
    ];
  });
  if (rows.length > 0) {
    await ctx.supabase.from("slot_prices").insert(rows);
  }

  redirect("/tableau-de-bord");
}

export async function updateEstablishment(
  _prev: TenancierResult,
  formData: FormData,
): Promise<TenancierResult> {
  const ctx = await requireTenancier();
  const id = String(formData.get("id") ?? "");
  if (!(await ownedEstablishmentId(ctx, id)))
    return { ok: false, error: "Accès refusé." };

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const stars = parseInt(String(formData.get("stars") ?? "0"), 10);
  const amenities = String(formData.get("amenities") ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .slice(0, 20);
  const isActive = formData.get("is_active") === "on";

  if (name.length < 2) return { ok: false, error: "Nom trop court." };
  if (city.length < 2) return { ok: false, error: "Ville requise." };

  const { error } = await ctx.supabase
    .from("establishments")
    .update({
      name,
      city,
      address: address || null,
      description: description || null,
      stars: stars >= 0 && stars <= 5 ? stars : 0,
      amenities,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Mise à jour impossible." };
  return { ok: true };
}

export async function updateSlotPrices(
  _prev: TenancierResult,
  formData: FormData,
): Promise<TenancierResult> {
  const ctx = await requireTenancier();
  const id = String(formData.get("id") ?? "");
  if (!(await ownedEstablishmentId(ctx, id)))
    return { ok: false, error: "Accès refusé." };

  for (const slot of SLOTS) {
    const price = parsePrice(formData.get(`price_${slot}`));
    const weekend = parsePrice(formData.get(`weekend_price_${slot}`));
    if (price == null) {
      await ctx.supabase
        .from("slot_prices")
        .delete()
        .eq("establishment_id", id)
        .eq("slot_type", slot);
    } else {
      await ctx.supabase.from("slot_prices").upsert(
        {
          establishment_id: id,
          slot_type: slot,
          price_fcfa: price,
          weekend_price_fcfa: weekend,
        },
        { onConflict: "establishment_id,slot_type" },
      );
    }
  }
  return { ok: true };
}

export async function updateBookingStatus(
  _prev: TenancierResult,
  formData: FormData,
): Promise<TenancierResult> {
  const ctx = await requireTenancier();
  const bookingId = String(formData.get("booking_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["confirmed", "cancelled", "completed", "no_show"].includes(status))
    return { ok: false, error: "Statut invalide." };

  const { data: booking } = await ctx.supabase
    .from("bookings")
    .select("id,establishment_id")
    .eq("id", bookingId)
    .single();
  if (!booking) return { ok: false, error: "Réservation introuvable." };
  if (!(await ownedEstablishmentId(ctx, booking.establishment_id)))
    return { ok: false, error: "Accès refusé." };

  const { error } = await ctx.supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (error) return { ok: false, error: "Mise à jour impossible." };
  return { ok: true };
}

/** Réponse du tenancier à un avis client. */
export async function replyToReview(
  _prev: TenancierResult,
  formData: FormData,
): Promise<TenancierResult> {
  const ctx = await requireTenancier();
  const reviewId = String(formData.get("review_id") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  if (!reviewId) return { ok: false, error: "Avis introuvable." };
  if (reply.length < 2) return { ok: false, error: "Réponse trop courte." };

  const { data: review } = await ctx.supabase
    .from("reviews")
    .select("id,establishment_id")
    .eq("id", reviewId)
    .single();
  if (!review) return { ok: false, error: "Avis introuvable." };
  if (!(await ownedEstablishmentId(ctx, review.establishment_id)))
    return { ok: false, error: "Accès refusé." };

  const { error } = await ctx.supabase
    .from("reviews")
    .update({ owner_reply: reply })
    .eq("id", reviewId);
  if (error) return { ok: false, error: "Envoi impossible." };
  return { ok: true };
}
