"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { createBooking, type BookingResult } from "@/lib/bookings/actions";
import {
  SLOT_LABELS,
  SLOT_ORDER,
  formatPrice,
  priceForDay,
  type SlotPrice,
  type SlotType,
} from "@/lib/repos";

const PAYMENTS = [
  { v: "airtel", label: "Airtel Money", Icon: Smartphone },
  { v: "moov", label: "Moov Money", Icon: Smartphone },
  { v: "carte", label: "Carte bancaire", Icon: CreditCard },
  { v: "sur_place", label: "Paiement sur place", Icon: Banknote },
] as const;

const TIMES = Array.from({ length: 15 }, (_, i) => {
  const h = 8 + i;
  return `${String(h).padStart(2, "0")}:00`;
});

const initial: BookingResult = { ok: false };

function frDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BookingForm({
  establishment,
  prices,
  defaultSlot,
  profile,
}: {
  establishment: { id: string; name: string; city: string; photos: string[] };
  prices: SlotPrice[];
  defaultSlot: string | undefined;
  profile: { full_name: string | null; phone: string | null } | null;
}) {
  const [state, action, pending] = useActionState(createBooking, initial);
  const [step, setStep] = useState(1);
  const [slot, setSlot] = useState<SlotType>(
    SLOT_ORDER.includes(defaultSlot as SlotType)
      ? (defaultSlot as SlotType)
      : "3h",
  );
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDay = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  }, []);
  const [day, setDay] = useState(today);
  const [arrivalTime, setArrivalTime] = useState("12:00");
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [payment, setPayment] = useState<string>("");

  const ordered = SLOT_ORDER.map((s) =>
    prices.find((p) => p.slot_type === s),
  ).filter((p) => p != null);
  const selected = prices.find((p) => p.slot_type === slot);
  const total = selected ? priceForDay(selected, day) : 0;
  const isWeekend =
    selected &&
    [0, 6].includes(new Date(`${day}T12:00:00`).getDay()) &&
    selected.weekend_price_fcfa != null;

  const step1Valid = !!selected && !!day;
  const step2Valid =
    name.trim().length >= 2 &&
    /^\+?[0-9][0-9 .\-()]{6,}$/.test(phone.trim()) &&
    !!payment;

  const steps = ["Créneau", "Coordonnées", "Confirmation"];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Progression */}
        <ol className="flex items-center gap-2">
          {steps.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                    done
                      ? "bg-pine-700 text-paper"
                      : active
                        ? "bg-pine-800 text-paper"
                        : "bg-pine-50 text-ink-faint"
                  }`}
                >
                  {done ? <Check className="size-4" /> : n}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    active ? "text-pine-950" : "text-ink-faint"
                  }`}
                >
                  {label}
                </span>
                {n < 3 && <span className="h-px flex-1 bg-line" />}
              </li>
            );
          })}
        </ol>

        {/* Étape 1 */}
        {step === 1 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Choisissez votre créneau
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {ordered.map((p) => (
                <button
                  key={p.slot_type}
                  type="button"
                  onClick={() => setSlot(p.slot_type)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    slot === p.slot_type
                      ? "border-pine-700 bg-pine-50 shadow-sm"
                      : "border-line bg-white hover:border-ink-faint"
                  }`}
                >
                  <p className="font-semibold text-ink">
                    {SLOT_LABELS[p.slot_type]}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-pine-900">
                    {formatPrice(priceForDay(p, day))}
                  </p>
                  {p.weekend_price_fcfa != null &&
                    p.weekend_price_fcfa !== p.price_fcfa && (
                      <p className="mt-0.5 text-xs text-ink-soft">
                        Week-end : {formatPrice(p.weekend_price_fcfa)}
                      </p>
                    )}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Date de venue
                </span>
                <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
                  <CalendarDays className="size-4 shrink-0 text-ink-faint" />
                  <input
                    type="date"
                    value={day}
                    min={today}
                    max={maxDay}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-transparent text-[15px] outline-none"
                  />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Heure d'arrivée prévue
                </span>
                <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
                  <Clock className="size-4 shrink-0 text-ink-faint" />
                  <select
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full bg-transparent text-[15px] outline-none"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>

            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-pine-800 px-8 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-50"
            >
              Continuer <ArrowRight className="size-4" />
            </button>
          </section>
        )}

        {/* Étape 2 */}
        {step === 2 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Vos coordonnées
            </h2>
            {!profile && (
              <p className="mt-2 text-sm text-ink-soft">
                Pas besoin de compte — votre code de réservation suffit le jour
                J.
              </p>
            )}
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Nom complet
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aïcha Bongo"
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Téléphone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+241 06 00 00 00"
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600"
                />
              </label>
            </div>

            <h3 className="mt-8 font-display text-xl font-semibold text-pine-950">
              Moyen de paiement
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map(({ v, label, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPayment(v)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    payment === v
                      ? "border-pine-700 bg-pine-50 shadow-sm"
                      : "border-line bg-white hover:border-ink-faint"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      payment === v
                        ? "bg-pine-700 text-paper"
                        : "bg-pine-50 text-pine-700"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck className="size-4 text-pine-700" />
              Le paiement mobile sera initié après confirmation. Sur place :
              réglez directement à l'établissement.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:border-pine-600"
              >
                <ArrowLeft className="size-4" /> Retour
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-8 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-50"
              >
                Vérifier <ArrowRight className="size-4" />
              </button>
            </div>
          </section>
        )}

        {/* Étape 3 */}
        {step === 3 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Vérifiez et confirmez
            </h2>
            <dl className="mt-5 space-y-3 rounded-3xl border border-line bg-white p-6">
              {(
                [
                  ["Établissement", establishment.name],
                  ["Date", frDate(day)],
                  [
                    "Créneau",
                    `${SLOT_LABELS[slot]} · arrivée ${arrivalTime}`,
                  ],
                  ["Nom", name.trim()],
                  ["Téléphone", phone.trim()],
                  [
                    "Paiement",
                    PAYMENTS.find((p) => p.v === payment)?.label ?? "",
                  ],
                ] as Array<[string, string]>
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 text-sm">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-sm font-semibold text-ink">Total</dt>
                <dd className="font-display text-xl font-semibold text-pine-900">
                  {formatPrice(total)}
                  {isWeekend && (
                    <span className="ml-2 align-middle text-xs font-normal text-ink-soft">
                      (tarif week-end)
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {state?.error && (
              <p
                role="alert"
                className="mt-4 rounded-2xl bg-clay-500/10 px-4 py-3 text-sm font-medium text-clay-600"
              >
                {state.error}
              </p>
            )}

            <form action={action} className="mt-6">
              <input
                type="hidden"
                name="establishment_id"
                value={establishment.id}
              />
              <input type="hidden" name="day" value={day} />
              <input type="hidden" name="slot_type" value={slot} />
              <input type="hidden" name="arrival_time" value={arrivalTime} />
              <input type="hidden" name="guest_name" value={name.trim()} />
              <input type="hidden" name="guest_phone" value={phone.trim()} />
              <input type="hidden" name="payment_method" value={payment} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:border-pine-600"
                >
                  <ArrowLeft className="size-4" /> Retour
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 text-[15px] font-semibold text-pine-950 transition hover:bg-gold-400 disabled:opacity-60"
                >
                  {pending ? "Confirmation…" : `Confirmer · ${formatPrice(total)}`}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* Récap latéral */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-3xl border border-line bg-white">
          {establishment.photos[0] && (
            <div className="relative aspect-[16/9]">
              <Image
                src={establishment.photos[0]}
                alt={establishment.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <p className="font-display text-lg font-semibold text-pine-950">
              {establishment.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="size-3.5 text-ink-faint" />
              {establishment.city}
            </p>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <p className="flex justify-between">
                <span className="text-ink-soft">Créneau</span>
                <span className="font-semibold text-ink">
                  {SLOT_LABELS[slot]}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-soft">Date</span>
                <span className="font-semibold text-ink">{frDate(day)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-soft">Total</span>
                <span className="font-display text-lg font-semibold text-pine-900">
                  {formatPrice(total)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
