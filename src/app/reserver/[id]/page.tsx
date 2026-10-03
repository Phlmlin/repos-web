import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { getEstablishment } from "@/lib/repos-server";
import { BookingForm } from "./booking-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await getEstablishment(id);
  return {
    title: e ? `Réserver — ${e.name}` : "Réserver — Repos",
  };
}

export default async function ReserverPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slot?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const e = await getEstablishment(id);
  if (!e || e.slot_prices.length === 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile: { full_name: string | null; phone: string | null } | null =
    null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name,phone")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/catalogue/${e.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-pine-800"
        >
          <ArrowLeft className="size-4" /> {e.name}
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-pine-950">
          Réserver votre journée
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Confirmation immédiate, code de réservation à présenter sur place.
        </p>
        <div className="mt-8">
          <BookingForm
            establishment={{
              id: e.id,
              name: e.name,
              city: e.city,
              photos: e.photos,
            }}
            prices={e.slot_prices}
            defaultSlot={sp.slot}
            profile={profile}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
