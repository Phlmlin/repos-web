import {
  Anchor,
  BedDouble,
  Car,
  Check,
  ChefHat,
  Clock,
  Coffee,
  Droplets,
  Dumbbell,
  Leaf,
  Map as MapIcon,
  Plane,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wine,
  type LucideIcon,
} from "lucide-react";

const RULES: Array<[RegExp, LucideIcon]> = [
  [/wifi/i, Wifi],
  [/piscine/i, Droplets],
  [/parking/i, Car],
  [/climatisation/i, Snowflake],
  [/petit[-\s]?d[ée]jeuner/i, Coffee],
  [/restaurant/i, UtensilsCrossed],
  [/cuisine/i, ChefHat],
  [/bar/i, Wine],
  [/spa/i, Sparkles],
  [/sport/i, Dumbbell],
  [/jardin|nature/i, Leaf],
  [/terrasse/i, Sun],
  [/bord de mer|\bmer\b/i, Waves],
  [/pirogue/i, Anchor],
  [/navette|a[ée]roport/i, Plane],
  [/gardien|discret|s[ée]curit/i, ShieldCheck],
  [/24\s?h/i, Clock],
  [/chambre/i, BedDouble],
  [/excursion/i, MapIcon],
];

/** Icône Lucide correspondant à un libellé d'équipement. */
export function amenityIcon(label: string): LucideIcon {
  for (const [re, Icon] of RULES) {
    if (re.test(label)) return Icon;
  }
  return Check;
}
