"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string; info?: string };

export async function signUp(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "tenancier" ? "tenancier" : "client";

  if (!fullName || !email || password.length < 8) {
    return { error: "Vérifiez les champs : nom, email valide, mot de passe de 8 caractères minimum." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Un compte existe déjà avec cet email. Connectez-vous." };
    }
    return { error: "Inscription impossible : " + error.message };
  }

  // Crée le profil applicatif (rôles, fidélité, parrainage).
  // Si le trigger SQL handle_new_user est installé, le profil existe déjà
  // (conflit ignoré). Sans session (confirmation email requise), le trigger
  // s'en charge seul.
  if (data.user && data.session) {
    const { error: pErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      role,
      referral_code: "REPOS-" + data.user.id.slice(0, 8).toUpperCase(),
    });
    if (pErr && !pErr.message.includes("duplicate")) {
      return { error: "Compte créé mais profil incomplet : " + pErr.message };
    }
  }

  revalidatePath("/", "layout");
  if (data.session) {
    redirect(role === "tenancier" ? "/tableau-de-bord" : "/compte");
  }
  // Email de confirmation requis par le projet Supabase
  redirect("/connexion?message=confirmez-email");
}

export async function signIn(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  // Redirige selon le rôle
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let dest = "/compte";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "tenancier") dest = "/tableau-de-bord";
    if (profile?.role === "admin") dest = "/admin";
  }

  revalidatePath("/", "layout");
  redirect(dest);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
