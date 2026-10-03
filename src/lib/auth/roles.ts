import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | undefined;
  fullName: string | null;
  role: string;
}

export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .single();

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
