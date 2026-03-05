"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeUserFromChurch } from "@/app/admin/actions";

interface RemoveFromChurchButtonProps {
  userId: string;
  churchId: string;
  email: string;
}

export function RemoveFromChurchButton({
  userId,
  churchId,
  email,
}: RemoveFromChurchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    if (!confirm) {
      setConfirm(true);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await removeUserFromChurch(userId, churchId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setConfirm(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${
          confirm
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {loading ? "..." : confirm ? "Confirmer la suppression" : "Retirer de l'église"}
      </button>
      {confirm && (
        <button
          type="button"
          onClick={() => { setConfirm(false); setError(null); }}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Annuler
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
