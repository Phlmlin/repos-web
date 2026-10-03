import type { AuthContext } from "@/lib/auth/roles";
import type { EstablishmentWithPrices, SlotPrice } from "@/lib/repos";

export interface TenancierBooking {
  id: string;
  code: string;
  day: string;
  slot_type: string;
  total_fcfa: number;
  payment_method: string;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_phone: string | null;
  arrival_time: string | null;
}

export async function getMyEstablishments(
  ctx: AuthContext,
): Promise<EstablishmentWithPrices[]> {
  let q = ctx.supabase
    .from("establishments")
    .select(
      "id,name,type,city,address,lat,lng,description,stars,amenities,photos,is_active,slot_prices(slot_type,price_fcfa,weekend_price_fcfa)",
    )
    .order("created_at", { ascending: true });
  if (ctx.role !== "admin") q = q.eq("owner_id", ctx.userId);
  const { data } = await q;
  return (data ?? []) as EstablishmentWithPrices[];
}

function toBooking(row: Record<string, unknown>): TenancierBooking {
  const extras = (row.extras ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    code: String(row.code),
    day: String(row.day),
    slot_type: String(row.slot_type),
    total_fcfa: Number(row.total_fcfa),
    payment_method: String(row.payment_method),
    status: String(row.status),
    created_at: String(row.created_at),
    guest_name: (extras.guest_name as string) ?? null,
    guest_phone: (extras.guest_phone as string) ?? null,
    arrival_time: (extras.arrival_time as string) ?? null,
  };
}

export async function getEstablishmentBookings(
  ctx: AuthContext,
  establishmentId: string,
  opts?: { upcomingOnly?: boolean; limit?: number },
): Promise<TenancierBooking[]> {
  const today = new Date().toISOString().slice(0, 10);
  let q = ctx.supabase
    .from("bookings")
    .select(
      "id,code,day,slot_type,total_fcfa,payment_method,status,extras,created_at",
    )
    .eq("establishment_id", establishmentId)
    .order("day", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts?.upcomingOnly) {
    q = q.gte("day", today).in("status", ["pending", "confirmed"]);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return ((data ?? []) as Record<string, unknown>[]).map(toBooking);
}

export interface DashboardStats {
  pending: number;
  upcoming: number;
  revenue30d: number;
  bookings30d: number;
  avgRating: number | null;
  reviewsCount: number;
}

export async function getDashboardStats(
  ctx: AuthContext,
  establishmentId: string,
): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const day30 = d30.toISOString().slice(0, 10);

  const { data: bookings } = await ctx.supabase
    .from("bookings")
    .select("day,total_fcfa,status")
    .eq("establishment_id", establishmentId)
    .gte("day", day30);

  const rows = (bookings ?? []) as Array<{
    day: string;
    total_fcfa: number;
    status: string;
  }>;
  const pending = rows.filter(
    (b) => b.status === "pending" && b.day >= today,
  ).length;
  const upcoming = rows.filter(
    (b) => ["pending", "confirmed"].includes(b.status) && b.day >= today,
  ).length;
  const done30 = rows.filter((b) =>
    ["confirmed", "completed"].includes(b.status),
  );
  const revenue30d = done30.reduce((s, b) => s + b.total_fcfa, 0);

  const { data: reviews } = await ctx.supabase
    .from("reviews")
    .select("rating")
    .eq("establishment_id", establishmentId)
    .eq("is_flagged", false);
  const ratings = (reviews ?? []) as Array<{ rating: number }>;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : null;

  return {
    pending,
    upcoming,
    revenue30d,
    bookings30d: rows.length,
    avgRating,
    reviewsCount: ratings.length,
  };
}

export function priceMap(
  prices: SlotPrice[],
): Partial<Record<string, SlotPrice>> {
  return Object.fromEntries(prices.map((p) => [p.slot_type, p]));
}

export interface DayCount {
  day: string;
  label: string;
  count: number;
}

/** Nombre de réservations par jour sur les N derniers jours. */
export async function getDailyCounts(
  ctx: AuthContext,
  establishmentId: string,
  days = 7,
): Promise<DayCount[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startIso = start.toISOString().slice(0, 10);

  const { data } = await ctx.supabase
    .from("bookings")
    .select("day")
    .eq("establishment_id", establishmentId)
    .gte("day", startIso)
    .not("status", "eq", "cancelled");

  const counts = new Map<string, number>();
  for (const d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    counts.set(iso, 0);
  }
  for (const b of (data ?? []) as Array<{ day: string }>) {
    counts.set(b.day, (counts.get(b.day) ?? 0) + 1);
  }
  return [...counts.entries()].map(([day, count]) => ({
    day,
    label: new Date(`${day}T12:00:00`)
      .toLocaleDateString("fr-FR", { weekday: "short" })
      .replace(".", ""),
    count,
  }));
}

export interface MonthStats {
  revenue: number;
  bookings: number;
}

/** Revenus et réservations du mois en cours (confirmées/terminées). */
export async function getMonthStats(
  ctx: AuthContext,
  establishmentId: string,
): Promise<MonthStats> {
  const first = new Date();
  first.setDate(1);
  const firstIso = first.toISOString().slice(0, 10);

  const { data } = await ctx.supabase
    .from("bookings")
    .select("total_fcfa")
    .eq("establishment_id", establishmentId)
    .gte("day", firstIso)
    .in("status", ["confirmed", "completed"]);

  const rows = (data ?? []) as Array<{ total_fcfa: number }>;
  return {
    revenue: rows.reduce((s, b) => s + b.total_fcfa, 0),
    bookings: rows.length,
  };
}

export interface TenancierReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  owner_reply: string | null;
  created_at: string;
  client_name: string | null;
}

export async function getEstablishmentReviews(
  ctx: AuthContext,
  establishmentId: string,
): Promise<TenancierReview[]> {
  const { data } = await ctx.supabase
    .from("reviews")
    .select("id,rating,title,comment,owner_reply,created_at,profiles(full_name)")
    .eq("establishment_id", establishmentId)
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    (data ?? []) as Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      owner_reply: string | null;
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
    owner_reply: r.owner_reply,
    created_at: r.created_at,
    client_name: Array.isArray(r.profiles)
      ? (r.profiles[0]?.full_name ?? null)
      : (r.profiles?.full_name ?? null),
  }));
}
