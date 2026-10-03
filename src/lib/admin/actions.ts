"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/roles";

export interface AdminResult {
  ok: boolean;
  error?: string;
}

const ROLES = ["client", "tenancier", "admin"] as const;

/** Change le rôle d'un utilisateur (admin uniquement). */
export async function updateUserRole(
  _prev: AdminResult,
  formData: FormData,
): Promise<AdminResult> {
  const ctx = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId) return { ok: false, error: "Utilisateur introuvable." };
  if (!(ROLES as readonly string[]).includes(role))
    return { ok: false, error: "Rôle invalide." };
  if (userId === ctx.userId)
    return { ok: false, error: "Vous ne pouvez pas modifier votre propre rôle." };

  // Sécurité : ne jamais rétrograder le dernier admin
  if (role !== "admin") {
    const { count } = await ctx.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .neq("id", userId);
    // Si l'utilisateur visé est admin et qu'il ne resterait aucun admin
    const { data: target } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (target?.role === "admin" && (count ?? 0) === 0) {
      return { ok: false, error: "Impossible : ce serait le dernier administrateur." };
    }
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { ok: false, error: "Mise à jour impossible." };

  revalidatePath("/admin");
  return { ok: true };
}

/** Valide (ou masque) un établissement. */
export async function setEstablishmentActive(
  _prev: AdminResult,
  formData: FormData,
): Promise<AdminResult> {
  const ctx = await requireAdmin();
  const id = String(formData.get("establishment_id") ?? "");
  const active = formData.get("is_active") === "true";
  if (!id) return { ok: false, error: "Établissement introuvable." };

  const { error } = await ctx.supabase
    .from("establishments")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: "Mise à jour impossible." };
  revalidatePath("/admin");
  return { ok: true };
}

/** Modère un avis signalé : le réhabiliter ou le supprimer. */
export async function resolveFlaggedReview(
  _prev: AdminResult,
  formData: FormData,
): Promise<AdminResult> {
  const ctx = await requireAdmin();
  const id = String(formData.get("review_id") ?? "");
  const action = String(formData.get("mod_action") ?? "");
  if (!id) return { ok: false, error: "Avis introuvable." };

  if (action === "unflag") {
    const { error } = await ctx.supabase
      .from("reviews")
      .update({ is_flagged: false })
      .eq("id", id);
    if (error) return { ok: false, error: "Mise à jour impossible." };
  } else if (action === "delete") {
    const { error } = await ctx.supabase.from("reviews").delete().eq("id", id);
    if (error) return { ok: false, error: "Suppression impossible." };
  } else {
    return { ok: false, error: "Action invalide." };
  }
  revalidatePath("/admin");
  return { ok: true };
}
