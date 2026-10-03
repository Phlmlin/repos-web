import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | undefined;
  fullName: string | null;
  role: string;
}

type SupaClient = Awaited<ReturnType<typeof createClient>>;
type AuthUser = { id: string; email?: string | null; user_metadata?: Record<string, unknown> };

/**
 * Filet de sécurité : si l'inscription n'a pas créé le profil applicatif
 * (ex. confirmation email active sans trigger SQL), on le crée à la
 * première visite à partir des métadonnées d'inscription (nom + rôle choisis).
 */
export async function ensureProfile(supa: SupaClient, user: AuthUser): Promise<void> {
  const { data: existing } = await supa
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = meta["role"] === "tenancier" ? "tenancier" : "client";
  const rawName = typeof meta["full_name"] === "string" ? meta["full_name"].trim() : "";
  const fullName = rawName || (user.email ?? "").split("@")[0] || null;
  await supa.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    role,
    referral_code: "REPOS-" + user.id.slice(0, 8).toUpperCase(),
  });
}

export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await ensureProfile(supabase, user);
    ({ data: profile } = await supabase
      .from("profiles")
      .select("full_name,role")
      .eq("id", user.id)
      .maybeSingle());
  }

  return {
    supabase,
    userId: user.id,
    email: user.email,
    fullName: profile?.full_name ?? null,
    role: profile?.role ?? "client",
  };
}

/** Tenancier ou admin, sinon redirection vers /compte. */
export async function requireTenancier(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.role !== "tenancier" && ctx.role !== "admin") redirect("/compte");
  return ctx;
}

/** Admin uniquement, sinon redirection vers /compte. */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.role !== "admin") redirect("/compte");
  return ctx;
}
