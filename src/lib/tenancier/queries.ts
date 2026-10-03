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
