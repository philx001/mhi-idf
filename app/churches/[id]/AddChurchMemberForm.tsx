"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignRole, type AppRole } from "@/app/admin/actions";

type UserWithoutRole = { id: string; email: string | undefined };

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "responsable_eglise", label: "Responsable église" },
  { value: "membre", label: "Membre" },
];

interface AddChurchMemberFormProps {
  churchId: string;
  usersWithoutRole: UserWithoutRole[];
  /** Si présent et responsable_eglise, seul Membre peut être attribué. */
  currentUserRole?: AppRole | null;
}

export function AddChurchMemberForm({
  churchId,
  usersWithoutRole,
  currentUserRole = null,
}: AddChurchMemberFormProps) {
  // Responsable d'église peut ajouter Responsable église ou Membre pour son église.
  const roleOptions = ROLE_OPTIONS;
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AppRole>("membre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    setLoading(true);
    const result = await assignRole(userId, role, churchId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUserId("");
    setRole("membre");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  }

  if (usersWithoutRole.length === 0) {
    return (
      <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        Aucun utilisateur sans rôle pour le moment. Pour ajouter un membre à cette église, invitez d’abord la personne depuis la{" "}
        <a href="/admin/gestion-utilisateurs" className="text-blue-600 hover:underline font-medium">
          Gestion des utilisateurs
        </a>{" "}
        (bouton « + Inviter un membre »). Une fois l’invitation acceptée, elle apparaîtra ici et vous pourrez l’ajouter.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="min-w-[200px]">
        <label htmlFor="add-member-user" className="block text-xs font-medium text-gray-700 mb-1">
          Utilisateur
        </label>
        <select
          id="add-member-user"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">— Choisir —</option>
          {usersWithoutRole.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email ?? u.id.slice(0, 8)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="add-member-role" className="block text-xs font-medium text-gray-700 mb-1">
          Rôle
        </label>
        <select
          id="add-member-role"
          value={role}
          onChange={(e) => setRole(e.target.value as AppRole)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !userId}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Ajout..." : "Ajouter à l'église"}
      </button>
      {error && <p className="text-sm text-red-600 w-full">{error}</p>}
      {success && <p className="text-sm text-green-600 w-full">Membre ajouté avec succès.</p>}
    </form>
  );
}
