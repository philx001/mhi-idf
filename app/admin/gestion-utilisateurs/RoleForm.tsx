"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignRole, updateUserRole, type AppRole } from "../actions";

type Church = { id: string; name: string };

interface RoleFormProps {
  mode: "assign" | "edit";
  userId: string;
  email: string;
  churches: Church[];
  initialRole?: AppRole;
  initialChurchId?: string | null;
  currentUserRole?: AppRole | null;
  currentUserChurchId?: string | null;
}

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "responsable_eglise", label: "Responsable église" },
  { value: "membre", label: "Membre" },
];

export function RoleForm({
  mode,
  userId,
  email,
  churches,
  initialRole = "membre",
  initialChurchId = null,
  currentUserRole = null,
  currentUserChurchId = null,
}: RoleFormProps) {
  const [role, setRole] = useState<AppRole>(initialRole);
  const [churchId, setChurchId] = useState<string>(initialChurchId ?? currentUserChurchId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEgliseUser = currentUserRole === "responsable_eglise";
  // Responsable d'église peut attribuer Responsable église ou Contributeur (uniquement pour son église) ; pas Admin.
  const roleOptions = isEgliseUser
    ? ROLE_OPTIONS.filter((o) => o.value !== "admin")
    : ROLE_OPTIONS;
  const churchOptions = isEgliseUser && currentUserChurchId
    ? churches.filter((c) => c.id === currentUserChurchId)
    : churches;
  const needsChurch = role === "responsable_eglise" || role === "membre";
  const finalChurchId = (role === "admin" || role === "responsable_siège") ? null : churchId || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result =
      mode === "assign"
        ? await assignRole(userId, role, finalChurchId)
        : await updateUserRole(userId, role, finalChurchId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-blue-600 hover:underline font-medium"
      >
        {mode === "assign" ? "Attribuer un rôle" : "Modifier le rôle"}
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {roleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {needsChurch && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Église (obligatoire)</label>
              <select
                value={churchId}
                onChange={(e) => setChurchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required={needsChurch}
              >
                {!churchOptions.some((c) => c.id === churchId) && churchOptions.length > 0 && (
                  <option value="">— Choisir une église —</option>
                )}
                {churchOptions.length === 0 && <option value="">Aucune église disponible</option>}
                {churchOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : mode === "assign" ? "Attribuer" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-gray-600 text-sm hover:underline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
