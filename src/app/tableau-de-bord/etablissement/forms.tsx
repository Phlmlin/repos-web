"use client";

import { useActionState } from "react";
import {
  createEstablishment,
  updateEstablishment,
  updateSlotPrices,
  type TenancierResult,
} from "@/lib/tenancier/actions";
import {
  SLOT_LABELS,
  SLOT_ORDER,
  TYPE_LABELS,
  type EstablishmentType,
  type EstablishmentWithPrices,
  type SlotPrice,
} from "@/lib/repos";

const initial: TenancierResult = { ok: false };

const TYPES: EstablishmentType[] = ["hotel", "motel", "maison", "auberge"];

const inputCls =
  "mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-pine-600";
const labelCls = "block text-sm font-semibold text-ink";

function Feedback({ state }: { state: TenancierResult }) {
  if (state.error)
    return (
      <p
        role="alert"
        className="rounded-2xl bg-clay-500/10 px-4 py-3 text-sm font-medium text-clay-600"
      >
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p
        role="status"
        className="rounded-2xl bg-pine-700/10 px-4 py-3 text-sm font-medium text-pine-700"
      >
        Enregistré avec succès.
      </p>
    );
  return null;
}

export function CreateEstablishmentForm() {
  const [state, action, pending] = useActionState(createEstablishment, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelCls}>
          Nom de l'établissement
          <input name="name" required placeholder="Hôtel Le Palmier" className={inputCls} />
        </label>
        <label className={labelCls}>
          Type
          <select name="type" className={inputCls} defaultValue="hotel">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Ville
          <input name="city" required placeholder="Libreville" className={inputCls} />
        </label>
        <label className={labelCls}>
          Adresse / quartier
          <input name="address" placeholder="Quartier Louis" className={inputCls} />
        </label>
        <label className={labelCls}>
          Étoiles
          <select name="stars" className={inputCls} defaultValue="0">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>
                {s === 0 ? "Non classé" : `${s} étoile${s > 1 ? "s" : ""}`}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Équipements <span className="font-normal text-ink-faint">(séparés par des virgules)</span>
          <input
            name="amenities"
            placeholder="Wifi, Piscine, Parking, Climatisation"
            className={inputCls}
          />
        </label>
      </div>
      <label className={labelCls}>
        Description
        <textarea
          name="description"
          rows={4}
          placeholder="Décrivez votre établissement, son ambiance, ses atouts…"
          className={inputCls}
        />
      </label>

      <h3 className="font-display text-xl font-semibold text-pine-950 pt-2">
        Tarifs par créneau <span className="text-sm font-normal text-ink-faint">(FCFA — laissez vide pour désactiver un créneau)</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOT_ORDER.map((slot) => (
          <div key={slot} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-sm font-semibold text-ink">{SLOT_LABELS[slot]}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                name={`price_${slot}`}
                inputMode="numeric"
                placeholder="Prix"
                className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-pine-600"
              />
              <input
                name={`weekend_price_${slot}`}
                inputMode="numeric"
                placeholder="Week-end"
                className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-pine-600"
              />
            </div>
          </div>
        ))}
      </div>

      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-pine-800 px-8 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer ma fiche établissement"}
      </button>
    </form>
  );
}

export function EditEstablishmentForms({
  establishment,
}: {
  establishment: EstablishmentWithPrices;
}) {
  const [infoState, infoAction, infoPending] = useActionState(
    updateEstablishment,
    initial,
  );
  const [priceState, priceAction, pricePending] = useActionState(
    updateSlotPrices,
    initial,
  );
  const prices: Partial<Record<string, SlotPrice>> = Object.fromEntries(
    establishment.slot_prices.map((p) => [p.slot_type, p]),
  );

  return (
    <div className="space-y-10">
      <form action={infoAction} className="space-y-5">
        <input type="hidden" name="id" value={establishment.id} />
        <h3 className="font-display text-xl font-semibold text-pine-950">
          Informations générales
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelCls}>
            Nom
            <input name="name" required defaultValue={establishment.name} className={inputCls} />
          </label>
          <label className={labelCls}>
            Ville
            <input name="city" required defaultValue={establishment.city} className={inputCls} />
          </label>
          <label className={labelCls}>
            Adresse / quartier
            <input name="address" defaultValue={establishment.address ?? ""} className={inputCls} />
          </label>
          <label className={labelCls}>
            Étoiles
            <select name="stars" defaultValue={establishment.stars ?? 0} className={inputCls}>
              {[0, 1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s === 0 ? "Non classé" : `${s} étoile${s > 1 ? "s" : ""}`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelCls}>
          Équipements <span className="font-normal text-ink-faint">(séparés par des virgules)</span>
          <input
            name="amenities"
            defaultValue={establishment.amenities.join(", ")}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={establishment.description ?? ""}
            className={inputCls}
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={establishment.is_active}
            className="size-4.5 accent-pine-800"
          />
          Fiche visible dans le catalogue
        </label>
        <Feedback state={infoState} />
        <button
          type="submit"
          disabled={infoPending}
          className="rounded-full bg-pine-800 px-8 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
        >
          {infoPending ? "Enregistrement…" : "Enregistrer les informations"}
        </button>
      </form>

      <form action={priceAction} className="space-y-5">
        <input type="hidden" name="id" value={establishment.id} />
        <h3 className="font-display text-xl font-semibold text-pine-950">
          Tarifs par créneau <span className="text-sm font-normal text-ink-faint">(FCFA)</span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {SLOT_ORDER.map((slot) => (
            <div key={slot} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-semibold text-ink">{SLOT_LABELS[slot]}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  name={`price_${slot}`}
                  inputMode="numeric"
                  placeholder="Prix"
                  defaultValue={prices[slot]?.price_fcfa ?? ""}
                  className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-pine-600"
                />
                <input
                  name={`weekend_price_${slot}`}
                  inputMode="numeric"
                  placeholder="Week-end"
                  defaultValue={prices[slot]?.weekend_price_fcfa ?? ""}
                  className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-pine-600"
                />
              </div>
            </div>
          ))}
        </div>
        <Feedback state={priceState} />
        <button
          type="submit"
          disabled={pricePending}
          className="rounded-full bg-pine-800 px-8 py-3 text-sm font-semibold text-paper transition hover:bg-pine-900 disabled:opacity-60"
        >
          {pricePending ? "Enregistrement…" : "Enregistrer les tarifs"}
        </button>
      </form>
    </div>
  );
}
