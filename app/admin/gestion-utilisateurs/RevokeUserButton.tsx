"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revokeUserAccess, restoreUserAccess } from "../actions";

interface RevokeUserButtonProps {
  userId: string;
  email: string;
  banned: boolean;
  currentUserId?: string;
}

export function RevokeUserButton({
  userId,
  email,
  banned,
  currentUserId,
}: RevokeUserButtonProps) {
  const isSelf = currentUserId != null && userId === currentUserId;
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    const { error } = banned
      ? await restoreUserAccess(userId)
      : await revokeUserAccess(userId);

    setLoading(false);
    setConfirm(false);

    if (error) {
      alert(error);
      return;
    }

    router.refresh();
  }

  if (isSelf) {
    return (
      <span className="text-sm text-gray-500 shrink-0">Vous</span>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${
          banned
            ? "bg-green-600 text-white hover:bg-green-700"
            : confirm
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {loading
          ? "..."
          : banned
          ? "Restaurer l'accès"
          : confirm
          ? "Confirmer la révocation"
          : "Révoquer l'accès"}
      </button>
      {confirm && !banned && (
        <button
          type="button"
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
