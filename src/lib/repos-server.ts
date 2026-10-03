import { createClient } from "@/lib/supabase/server";
import type { EstablishmentWithPrices, Review } from "@/lib/repos";

const EST_SELECT =
  "id,name,type,city,address,lat,lng,description,stars,amenities,photos,is_active";

export async function getEstablishments(): Promise<EstablishmentWithPrices[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("establishments")
    .select(`${EST_SELECT},slot_prices(slot_type,price_fcfa,weekend_price_fcfa)`)
    .eq("is_active", true)
    .order("stars", { ascending: false, nullsFirst: false })
    .order("name");
  if (error) throw new Error(`Catalogue indisponible : ${error.message}`);
  return (data ?? []) as EstablishmentWithPrices[];
}

export async function getEstablishment(
  id: string,
): Promise<(EstablishmentWithPrices & { reviews: Review[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("establishments")
    .select(`${EST_SELECT},slot_prices(slot_type,price_fcfa,weekend_price_fcfa)`)
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (error || !data) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id,rating,title,comment,created_at,profiles(full_name)")
    .eq("establishment_id", id)
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    ...(data as EstablishmentWithPrices),
    reviews: (
      (reviews ?? []) as Array<{
        id: string;
        rating: number;
        title: string | null;
        comment: string | null;
        created_at: string;
        profiles:
          | { full_name: string | null }
          | Array<{ full_name: string | null }>
          | null;
      }>
    ).map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      created_at: r.created_at,
      client_name: Array.isArray(r.profiles)
        ? (r.profiles[0]?.full_name ?? null)
        : (r.profiles?.full_name ?? null),
    })),
  };
}
