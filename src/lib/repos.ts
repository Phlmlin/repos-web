export type SlotType = "3h" | "6h" | "journee" | "nuit";
export type EstablishmentType = "hotel" | "motel" | "maison" | "auberge";

export interface SlotPrice {
  slot_type: SlotType;
  price_fcfa: number;
  weekend_price_fcfa: number | null;
}

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  stars: number | null;
  amenities: string[];
  photos: string[];
}

export interface EstablishmentWithPrices extends Establishment {
  slot_prices: SlotPrice[];
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  client_name: string | null;
}

export const SLOT_LABELS: Record<SlotType, string> = {
  "3h": "3 heures",
  "6h": "6 heures",
  journee: "Journée",
  nuit: "Nuitée",
};

export const TYPE_LABELS: Record<EstablishmentType, string> = {
  hotel: "Hôtel",
  motel: "Motel",
  maison: "Maison meublée",
  auberge: "Auberge",
};

export const SLOT_ORDER: SlotType[] = ["3h", "6h", "journee", "nuit"];

/** "15000" → "15 000 FCFA" */
export function formatPrice(fcfa: number): string {
  return `${fcfa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

export function minPrice(prices: SlotPrice[]): number | null {
  if (prices.length === 0) return null;
  return Math.min(...prices.map((p) => p.price_fcfa));
}

/** Prix applicable selon le jour (week-end si défini et sam/dim). */
export function priceForDay(p: SlotPrice, day: string): number {
  const d = new Date(`${day}T12:00:00`);
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  if (weekend && p.weekend_price_fcfa != null) return p.weekend_price_fcfa;
  return p.price_fcfa;
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}
