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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`text-xs ${confirm ? "text-red-600 font-medium" : "text-gray-500 hover:text-red-600"} disabled:opacity-50`}
      >
        {loading ? "..." : confirm ? "Cliquer pour confirmer" : "Retirer de l'église"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
