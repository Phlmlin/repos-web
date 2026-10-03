"use client";

import { useActionState } from "react";
import { updateUserRole, type AdminResult } from "@/lib/admin/actions";

const initial: AdminResult = { ok: false };

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  tenancier: "Tenancier",
  admin: "Admin",
};

export function RoleSelect({
  userId,
  currentRole,
  disabled = false,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateUserRole, initial);

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="user_id" value={userId} />
        <select
          name="role"
          defaultValue={currentRole}
          disabled={disabled || pending}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          title={disabled ? "Vous ne pouvez pas modifier votre propre rôle" : "Changer le rôle"}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-pine-600 disabled:opacity-50"
        >
          {Object.entries(ROLE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </form>
      {state?.error && (
        <p className="mt-1 text-xs text-clay-600">{state.error}</p>
      )}
    </div>
  );
}
